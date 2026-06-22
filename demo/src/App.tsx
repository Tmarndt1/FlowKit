import * as React from "react";
import { Position } from "../../lib/enums/Position";
import {
  EdgeCollapseMode,
  EdgePathType,
  IConnection,
  IEdge,
  INode,
  updateWorkflowDecisionTableBranches,
  workflowNodeTypes,
} from "../../lib/index";
import { NodeInspector } from "./components/NodeInspector";
import { NodePalette } from "./components/NodePalette";
import { NetworkDiagram } from "./components/NetworkDiagram";
import { DemoView, TopBar } from "./components/TopBar";
import { VolumeUtilizationWorkflow, volumeWorkflowStats } from "./components/VolumeUtilizationWorkflow";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import {
  DecisionBranch,
  RuntimeVariable,
  ValueType,
  WorkflowEdge,
  WorkflowEndpointData,
  WorkflowNode as WorkflowNodeType,
  WorkflowNodeData,
  WorkflowPreset,
} from "./types";
import {
  createNode,
  getNodeNumber,
  initialContainers,
  initialEdges,
  initialNodes,
  initialRuntimeVariables,
} from "./workflowModel";

export function App() {
  const [nodes, setNodes] = React.useState<WorkflowNodeType[]>(initialNodes);
  const [edges, setEdges] = React.useState<WorkflowEdge[]>(initialEdges);
  const [containers, setContainers] = React.useState(initialContainers);
  const [runtimeVariables, setRuntimeVariables] = React.useState<RuntimeVariable[]>(initialRuntimeVariables);
  const [selectedKey, setSelectedKey] = React.useState<string | null>("runtime-multiplier");
  const [executionStatus, setExecutionStatus] = React.useState<"idle" | "success">("idle");
  const [lastRunLabel, setLastRunLabel] = React.useState("Idle");
  const [edgePathType, setEdgePathType] = React.useState<EdgePathType>("bezier");
  const [animatedEdges, setAnimatedEdges] = React.useState(false);
  const [collapsibleEdges, setCollapsibleEdges] = React.useState(true);
  const [demoView, setDemoView] = React.useState<DemoView>("workflow");
  const activeNodeCount = demoView === "utilization" ? volumeWorkflowStats.nodeCount : nodes.length;
  const activeEdgeCount = demoView === "utilization" ? volumeWorkflowStats.edgeCount : edges.length;

  const selectedNode = React.useMemo(
    () => nodes.find((node) => node.key === selectedKey) ?? nodes.find((node) => node.key === "runtime-multiplier") ?? null,
    [nodes, selectedKey]
  );

  const onConnect = React.useCallback((connection: IConnection) => {
    setEdges((currentEdges) => {
      const edgeExists = currentEdges.some(
        (edge) => edge.sourceId === connection.sourceId && edge.targetId === connection.targetId
      );

      if (edgeExists) return currentEdges;

      return [
        ...currentEdges,
        {
          key: `edge-${connection.sourceId}-${connection.targetId}`,
          type: "edge",
          sourceId: connection.sourceId,
          targetId: connection.targetId,
        },
      ];
    });
  }, []);

  const onRemove = React.useCallback((node: INode<any, any> | null, removedEdges: IEdge<any>[]) => {
    if (node != null) {
      setNodes((currentNodes) => currentNodes.filter((item) => item.key !== node.key));
      setContainers((currentContainers) =>
        currentContainers.map((container) => ({
          ...container,
          nodeKeys: container.nodeKeys.filter((nodeKey) => nodeKey !== node.key),
        }))
      );
    }

    setEdges((currentEdges) =>
      currentEdges.filter((edge) => !removedEdges.some((removedEdge) => removedEdge.key === edge.key))
    );
  }, []);

  const updateCollapsibleEdges = React.useCallback((enabled: boolean) => {
    setCollapsibleEdges(enabled);

    if (!enabled) {
      setEdges((currentEdges) => currentEdges.map((edge) => ({ ...edge, collapsed: false, collapseMode: undefined })));
    }
  }, []);

  const onEdgeCollapsedChange = React.useCallback((edgeKey: string, collapsed: boolean, mode: EdgeCollapseMode) => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.key === edgeKey
          ? {
              ...edge,
              collapsed,
              collapseMode: collapsed ? mode : undefined,
            }
          : edge
      )
    );
  }, []);

  const addNode = React.useCallback((preset: WorkflowPreset) => {
    setNodes((currentNodes) => {
      const nodeNumber = getNodeNumber(currentNodes);
      const nodeKey = `workflow-node-${nodeNumber}`;
      const offset = (nodeNumber - 1) * 30;

      const variableDefaults =
        preset.type === "variable-input"
          ? {
              subtitle: "runtime.value",
              value: "query on run",
              valueSource: "Execution variable",
              variableKey: "runtime.value",
              variableQuery: "variables.get('runtime.value')",
            }
          : {};

      return [...currentNodes, createNode(preset.type, nodeKey, { x: 250 + offset, y: 520 + offset }, variableDefaults)];
    });
  }, []);

  const updateRuntimeVariable = React.useCallback((key: string, value: string) => {
    setRuntimeVariables((currentVariables) =>
      currentVariables.map((variable) => (variable.key === key ? { ...variable, value } : variable))
    );
  }, []);

  const updateNodeData = React.useCallback((nodeKey: string, data: Partial<WorkflowNodeData>) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.key === nodeKey
          ? {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          : node
      )
    );
  }, []);

  const updateEndpointData = React.useCallback(
    (nodeKey: string, endpointId: string, data: Partial<WorkflowEndpointData>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.key !== nodeKey) return node;

          const nextEndpoints = node.endpoints.map((endpoint) =>
            endpoint.id === endpointId
              ? {
                  ...endpoint,
                  data: {
                    ...endpoint.data,
                    ...data,
                  },
                }
              : endpoint
          );

          const isVariableOutput =
            node.data?.variableKey != null &&
            endpointId === node.endpoints.find((endpoint) => endpoint.position === Position.Right)?.id &&
            data.valueType != null;

          if (isVariableOutput) {
            setRuntimeVariables((currentVariables) =>
              currentVariables.map((variable) =>
                variable.key === node.data?.variableKey ? { ...variable, valueType: data.valueType as ValueType } : variable
              )
            );
          }

          return {
            ...node,
            endpoints: nextEndpoints,
          };
        })
      );
    },
    []
  );

  const updateDecisionTableBranches = React.useCallback((nodeKey: string, branches: DecisionBranch[]) => {
    const nextEndpointIds = new Set(branches.map((branch) => `${nodeKey}-threshold-${branch.id}`));

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.key !== nodeKey || node.data?.styleVariant !== "threshold-policy") return node;

        const nextNode = updateWorkflowDecisionTableBranches(node, branches);
        return nextNode;
      })
    );

    setEdges((currentEdges) =>
      currentEdges.filter((edge) => {
        if (!edge.sourceId.startsWith(`${nodeKey}-threshold-`)) return true;
        return nextEndpointIds.has(edge.sourceId);
      })
    );
  }, []);

  const updateVariableConfig = React.useCallback(
    (nodeKey: string, config: { identifier?: string; name?: string; valueType?: ValueType }) => {
      const currentNode = nodes.find((node) => node.key === nodeKey);
      const previousKey = currentNode?.data?.variableKey;
      const nextKey = config.identifier?.trim();

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.key !== nodeKey) return node;
          const variableKey = nextKey != null && nextKey.length > 0 ? nextKey : node.data?.variableKey;
          const variableQuery = variableKey == null ? undefined : `variables.get('${variableKey}')`;

          return {
            ...node,
            data: {
              ...node.data,
              subtitle: variableKey,
              title: config.name ?? node.data?.title,
              variableKey,
              variableQuery,
            },
            endpoints:
              config.valueType == null
                ? node.endpoints
                : node.endpoints.map((endpoint) =>
                    endpoint.position === Position.Right
                      ? {
                          ...endpoint,
                          data: {
                            ...endpoint.data,
                            valueType: config.valueType,
                          },
                        }
                      : endpoint
                  ),
          };
        })
      );

      if (config.identifier != null || config.valueType != null || config.name != null) {
        setRuntimeVariables((currentVariables) => {
          const fallbackKey = nextKey != null && nextKey.length > 0 ? nextKey : previousKey ?? "runtime.value";
          const existing = currentVariables.find((variable) => variable.key === previousKey);
          const hasFallback = currentVariables.some((variable) => variable.key === fallbackKey);
          const nextVariables = currentVariables.map((variable) => {
            if (variable.key !== previousKey) return variable;
            return {
              ...variable,
              description: config.name == null ? variable.description : `${config.name} fetched during execution.`,
              key: fallbackKey,
              query: `variables.get('${fallbackKey}')`,
              valueType: config.valueType ?? variable.valueType,
            };
          });

          if (existing == null && !hasFallback) {
            return [
              ...nextVariables,
              {
                description: `${config.name ?? "Variable"} fetched during execution.`,
                key: fallbackKey,
                query: `variables.get('${fallbackKey}')`,
                value: "",
                valueType: config.valueType ?? "any",
              },
            ];
          }

          return nextVariables;
        });
      }
    },
    [nodes]
  );

  const runWorkflow = React.useCallback(() => {
    const queriedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const variableMap = new Map(runtimeVariables.map((variable) => [variable.key, variable]));

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const variableKey = node.data?.variableKey;
        if (variableKey == null) return node;

        const variable = variableMap.get(variableKey);
        return {
          ...node,
          data: {
            ...node.data,
            resolvedAt: queriedAt,
            subtitle: variableKey,
            value: variable?.value ?? "missing",
            valueSource: variable == null ? "Variable not found" : `Queried ${variable.query}`,
          },
        };
      })
    );
    setExecutionStatus("success");
    setLastRunLabel(queriedAt);
  }, [runtimeVariables]);

  return (
    <main className="demo-shell">
      <TopBar
        demoView={demoView}
        edgeCount={activeEdgeCount}
        edgePathType={edgePathType}
        animatedEdges={animatedEdges}
        collapsibleEdges={collapsibleEdges}
        lastRunLabel={lastRunLabel}
        nodeCount={activeNodeCount}
        onAnimatedEdgesChange={setAnimatedEdges}
        onCollapsibleEdgesChange={updateCollapsibleEdges}
        onDemoViewChange={setDemoView}
        onEdgePathTypeChange={setEdgePathType}
        onRun={runWorkflow}
        status={executionStatus}
      />
      <div className={`demo-grid demo-grid-${demoView}`}>
        {demoView === "workflow" ? <NodePalette onAddNode={addNode} /> : null}
        <div className="workspace-column">
          {demoView === "workflow" ? (
            <WorkflowCanvas
              animatedEdges={animatedEdges}
              collapsibleEdges={collapsibleEdges}
              containers={containers}
              edgePathType={edgePathType}
              edges={edges}
              nodes={nodes}
              nodeTypes={workflowNodeTypes}
              onConnect={onConnect}
              onContainersChange={setContainers}
              onEdgeCollapsedChange={onEdgeCollapsedChange}
              onRemove={onRemove}
              onSelectionChange={setSelectedKey}
            />
          ) : demoView === "floating" ? (
            <NetworkDiagram
              animatedEdges={animatedEdges}
              collapsibleEdges={collapsibleEdges}
              edgePathType={edgePathType}
            />
          ) : (
            <VolumeUtilizationWorkflow
              animatedEdges={animatedEdges}
              collapsibleEdges={collapsibleEdges}
              edgePathType={edgePathType}
            />
          )}
        </div>
        {demoView === "workflow" ? (
          <NodeInspector
            node={selectedNode}
            onDecisionTableBranchesChange={updateDecisionTableBranches}
            onEndpointChange={updateEndpointData}
            onNodeDataChange={updateNodeData}
            onVariableConfigChange={updateVariableConfig}
            onVariableValueChange={updateRuntimeVariable}
            runtimeVariables={runtimeVariables}
          />
        ) : null}
      </div>
    </main>
  );
}
