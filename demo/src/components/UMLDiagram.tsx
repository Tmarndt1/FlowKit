import * as React from "react";
import {
  EdgePathType,
  FlowKit,
  FlowKitControls,
  FlowKitDots,
  FlowKitEvents,
  IEdge,
  INode,
} from "../../../lib/index";

// ─── Node types ──────────────────────────────────────────────────────────────

interface ClassData {
  name: string;
  stereotype?: "interface" | "abstract" | "enum";
  attributes?: string[];
  methods?: string[];
}

function ClassNode({ data, selected }: { data: ClassData; selected: boolean }) {
  const headerClass = [
    "uml-class-header",
    data.stereotype === "interface" ? "uml-class-header--interface" : "",
    data.stereotype === "abstract"  ? "uml-class-header--abstract"  : "",
    data.stereotype === "enum"      ? "uml-class-header--enum"      : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`uml-class${selected ? " uml-class--selected" : ""}`}>
      <div className={headerClass}>
        {data.stereotype && (
          <span className="uml-stereotype">&laquo;{data.stereotype}&raquo;</span>
        )}
        <span className="uml-class-name">{data.name}</span>
      </div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="uml-section">
          {data.attributes.map((a) => (
            <div key={a} className="uml-member uml-attribute">{a}</div>
          ))}
        </div>
      )}
      {data.methods && data.methods.length > 0 && (
        <div className="uml-section">
          {data.methods.map((m) => (
            <div key={m} className="uml-member uml-method">{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { "uml-class": ClassNode };

// ─── Nodes ───────────────────────────────────────────────────────────────────

function cls(
  key: string,
  x: number,
  y: number,
  data: ClassData
): INode<ClassData, never> {
  return { key, type: "uml-class", offset: { x, y }, endpoints: [], data };
}

const initialNodes: INode<ClassData, never>[] = [
  // Interfaces (top row) — centered above Entity
  cls("ISerializable", 60, 50, {
    name: "ISerializable",
    stereotype: "interface",
    methods: ["+ serialize(): string", "+ deserialize(s): void"],
  }),
  cls("IComparable", 300, 50, {
    name: "IComparable",
    stereotype: "interface",
    methods: ["+ compareTo(other): int"],
  }),

  // Abstract base — below and between the two interfaces
  cls("Entity", 180, 250, {
    name: "Entity",
    stereotype: "abstract",
    attributes: ["# id: UUID", "# createdAt: Date"],
    methods: ["+ equals(other): bool", "+ toString(): string"],
  }),

  // Concrete subclasses — directly below Entity, side by side
  cls("Customer", 40, 470, {
    name: "Customer",
    attributes: ["- name: string", "- email: string"],
    methods: ["+ placeOrder(): Order", "+ getHistory(): Order[]"],
  }),
  cls("Product", 320, 470, {
    name: "Product",
    attributes: ["- sku: string", "- price: Money"],
    methods: ["+ getPrice(): Money"],
  }),

  // Order — to the right, mid-level
  cls("Order", 590, 250, {
    name: "Order",
    attributes: ["- status: OrderStatus", "- total: Money"],
    methods: ["+ addLine(p, qty): void", "+ submit(): void"],
  }),

  // OrderLine — below Order (composition)
  cls("OrderLine", 590, 470, {
    name: "OrderLine",
    attributes: ["- quantity: int", "- unitPrice: Money"],
    methods: ["+ lineTotal(): Money"],
  }),

  // PaymentService — far right, same row as Order
  cls("PaymentService", 840, 250, {
    name: "PaymentService",
    attributes: ["- gateway: string"],
    methods: ["+ charge(order): Receipt", "+ refund(id): void"],
  }),
];

// ─── Edges ───────────────────────────────────────────────────────────────────

function edge(
  key: string,
  sourceId: string,
  targetId: string,
  extra: Partial<IEdge<{ relationship: string }>>
): IEdge<{ relationship: string }> {
  return {
    key,
    type: "edge",
    sourceId,
    targetId,
    anchorMode: "floating",
    ...extra,
  };
}

const initialEdges: IEdge<{ relationship: string }>[] = [
  // Realization — dashed line + hollow triangle at the interface end
  edge("e-entity-serializable", "Entity", "ISerializable", {
    markerEnd: "hollow-triangle",
    strokeStyle: "dashed",
    data: { relationship: "realization" },
  }),
  edge("e-entity-comparable", "Entity", "IComparable", {
    markerEnd: "hollow-triangle",
    strokeStyle: "dashed",
    data: { relationship: "realization" },
  }),

  // Inheritance — solid line + hollow triangle at the parent end
  edge("e-customer-entity", "Customer", "Entity", {
    markerEnd: "hollow-triangle",
    data: { relationship: "inheritance" },
  }),
  edge("e-product-entity", "Product", "Entity", {
    markerEnd: "hollow-triangle",
    data: { relationship: "inheritance" },
  }),

  // Composition — filled diamond at the whole end, arrow at the part end
  edge("e-order-orderline", "Order", "OrderLine", {
    markerStart: "filled-diamond",
    markerEnd: "arrow",
    data: { relationship: "composition" },
  }),

  // Association — plain arrow (customer places orders)
  edge("e-customer-order", "Customer", "Order", {
    markerEnd: "arrow",
    data: { relationship: "association" },
  }),

  // Aggregation — hollow diamond at the whole end (order references product)
  edge("e-order-product", "Order", "Product", {
    markerStart: "hollow-diamond",
    markerEnd: "open-arrow",
    data: { relationship: "aggregation" },
  }),

  // Dependency — dashed + open arrow (PaymentService depends on Order)
  edge("e-payment-order", "PaymentService", "Order", {
    markerEnd: "open-arrow",
    strokeStyle: "dashed",
    data: { relationship: "dependency" },
    label: "«uses»",
  }),
];

// ─── Legend ──────────────────────────────────────────────────────────────────

const LEGEND: { label: string; marker: string; stroke: string }[] = [
  { label: "Inheritance",  marker: "hollow-triangle", stroke: "solid"  },
  { label: "Realization",  marker: "hollow-triangle", stroke: "dashed" },
  { label: "Composition",  marker: "filled-diamond",  stroke: "solid"  },
  { label: "Aggregation",  marker: "hollow-diamond",  stroke: "solid"  },
  { label: "Association",  marker: "arrow",           stroke: "solid"  },
  { label: "Dependency",   marker: "open-arrow",      stroke: "dashed" },
];

function UMLLegend() {
  return (
    <div className="uml-legend">
      <strong className="uml-legend-title">Relationships</strong>
      {LEGEND.map((row) => (
        <div key={row.label} className="uml-legend-row">
          <svg width={52} height={16} className="uml-legend-line">
            <defs>
              <marker id={`leg-arrow-${row.marker}`} markerWidth="8" markerHeight="8"
                refX="8" refY="4" orient="auto-start-reverse" viewBox="0 0 10 8">
                {row.marker === "arrow" && (
                  <path d="M0 0 L10 4 L0 8 Z" className="uml-legend-marker-filled" />
                )}
                {row.marker === "open-arrow" && (
                  <path d="M0 0 L10 4 L0 8" fill="none" className="uml-legend-marker-open" />
                )}
                {row.marker === "hollow-triangle" && (
                  <path d="M0 0 L10 4 L0 8 Z" fill="none" className="uml-legend-marker-hollow" />
                )}
                {row.marker === "filled-diamond" && (
                  <path d="M0 4 L5 0 L10 4 L5 8 Z" className="uml-legend-marker-filled" />
                )}
                {row.marker === "hollow-diamond" && (
                  <path d="M0 4 L5 0 L10 4 L5 8 Z" fill="none" className="uml-legend-marker-hollow" />
                )}
              </marker>
            </defs>
            <line
              x1={4} y1={8} x2={44} y2={8}
              className="uml-legend-stroke"
              strokeDasharray={row.stroke === "dashed" ? "5 3" : undefined}
              markerEnd={`url(#leg-arrow-${row.marker})`}
            />
          </svg>
          <span>{row.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = { edgePathType: EdgePathType };

export function UMLDiagram({ edgePathType }: Props) {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges] = React.useState(initialEdges);

  return (
    <div className="uml-panel">
      <FlowKit
        centerOnLoad
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgePathType={edgePathType}
        zoomMin={0.3}
        zoomMax={2}
      >
        <FlowKitDots gap={22} color="rgba(88, 124, 168, .12)" />
        <FlowKitControls />
        <FlowKitEvents
          onNodesChange={(changes) => {
            setNodes((curr) => {
              let next = curr;
              changes.forEach((c) => {
                if (c.type === "position") {
                  next = next.map((n) => n.key === c.key ? { ...n, offset: c.offset } : n);
                }
              });
              return next;
            });
          }}
        />
      </FlowKit>
      <UMLLegend />
    </div>
  );
}
