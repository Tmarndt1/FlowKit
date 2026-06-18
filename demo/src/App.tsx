import * as React from "react";
import { Position } from "../../lib/enums/Position";
import { IConnection, IEdge, INode, NodeTypes } from "../../lib/index";
import { NodeInspector } from "./components/NodeInspector";
import { NodePalette } from "./components/NodePalette";
import { TopBar } from "./components/TopBar";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { WorkflowNode } from "./components/WorkflowNode";
import {
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

const nodeTypes: NodeTypes = {
  "number-input": WorkflowNode,
  "boolean-input": WorkflowNode,
  "text-input": WorkflowNode,
  "constant-input": WorkflowNode,
  "variable-input": WorkflowNode,
  "math-add": WorkflowNode,
  "math-subtract": WorkflowNode,
  "math-multiply": WorkflowNode,
  "math-divide": WorkflowNode,
  "math-round": WorkflowNode,
  "logic-greater-than": WorkflowNode,
  "logic-less-than": WorkflowNode,
  "logic-equal": WorkflowNode,
  "logic-and": WorkflowNode,
  "logic-or": WorkflowNode,
  "logic-not": WorkflowNode,
  "logic-branch": WorkflowNode,
  "utility-format": WorkflowNode,
  "utility-convert": WorkflowNode,
  "utility-coalesce": WorkflowNode,
  "utility-delay": WorkflowNode,
  "result-output": WorkflowNode,
  "log-output": WorkflowNode,
  "alert-output": WorkflowNode,
};

export function App() {
  const [nodes, setNodes] = React.useState<WorkflowNodeType[]>(initialNodes);
  const [edges, setEdges] = React.useState<WorkflowEdge[]>(initialEdges);
  const [containers, setContainers] = React.useState(initialContainers);
  const [runtimeVariables, setRuntimeVariables] = React.useState<RuntimeVariable[]>(initialRuntimeVariables);
  const [selectedKey, setSelectedKey] = React.useState<string | null>("runtime-multiplier");
  const [executionStatus, setExecutionStatus] = React.useState<"idle" | "success">("idle");
  const [lastRunLabel, setLastRunLabel] = React.useState("Idle");

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
        edgeCount={edges.length}
        lastRunLabel={lastRunLabel}
        nodeCount={nodes.length}
        onRun={runWorkflow}
        status={executionStatus}
      />
      <div className="demo-grid">
        <NodePalette onAddNode={addNode} />
        <div className="workspace-column">
          <WorkflowCanvas
            containers={containers}
            edges={edges}
            nodes={nodes}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onContainersChange={setContainers}
            onRemove={onRemove}
            onSelectionChange={setSelectedKey}
          />
        </div>
        <NodeInspector
          node={selectedNode}
          onEndpointChange={updateEndpointData}
          onNodeDataChange={updateNodeData}
          onVariableConfigChange={updateVariableConfig}
          onVariableValueChange={updateRuntimeVariable}
          runtimeVariables={runtimeVariables}
        />
      </div>
    </main>
  );
}
