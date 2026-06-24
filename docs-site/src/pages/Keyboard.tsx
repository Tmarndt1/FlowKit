import { CodeBlock } from "../components/CodeBlock";

export function Keyboard() {
    return (
        <div>
            <div className="page-tag">Components</div>
            <h1 className="page-title">Keyboard Commands</h1>
            <p className="page-desc">
                <code>FlowKitKeyboardCommands</code> is a non-visual child component that wires up keyboard shortcuts for
                the canvas. Render it inside <code>FlowKit</code> to activate the shortcuts.
            </p>

            <div className="section">
                <h2 className="section-title">Usage</h2>
                <CodeBlock code={`import { FlowKit, FlowKitKeyboardCommands } from "@flowkit";

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} ...>
  <FlowKitKeyboardCommands
    onDelete={(keys) => {
      setNodes(prev => prev.filter(n => !keys.includes(n.key)));
    }}
    onSelectAll={() => {
      setNodes(prev => prev.map(n => ({ ...n, selected: true })));
    }}
  />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Built-in Shortcuts</h2>
                <table className="props-table">
                    <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
                    <tbody>
                        {[
                            ["Delete / Backspace", "Delete selected nodes and edges."],
                            ["Ctrl/⌘ + A", "Select all nodes."],
                            ["Escape", "Deselect all nodes."],
                            ["Ctrl/⌘ + Z", "Undo (if undo handler provided)."],
                            ["Ctrl/⌘ + Shift + Z", "Redo (if redo handler provided)."],
                        ].map(([k, d]) => (
                            <tr key={k}>
                                <td><span className="prop-name">{k}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["onDelete", "(keys: string[]) => void", "Called with the keys of selected nodes when Delete/Backspace is pressed."],
                            ["onSelectAll", "() => void", "Called when Ctrl/⌘+A is pressed."],
                            ["onDeselect", "() => void", "Called when Escape is pressed."],
                            ["onUndo", "() => void", "Called when Ctrl/⌘+Z is pressed."],
                            ["onRedo", "() => void", "Called when Ctrl/⌘+Shift+Z is pressed."],
                            ["disabled", "boolean", "Disable all keyboard handling."],
                        ].map(([n, t, d]) => (
                            <tr key={n}>
                                <td><span className="prop-name">{n}</span></td>
                                <td><span className="prop-type">{t}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
