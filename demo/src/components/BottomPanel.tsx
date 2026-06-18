const logRows = [
  ["10:15:22", "Number Input (A)", "Output: 10"],
  ["10:15:22", "Number Input (B)", "Output: 4"],
  ["10:15:22", "Multiply", "10 x 4 = 40"],
  ["10:15:22", "Number Input (C)", "Output: 2"],
  ["10:15:22", "Add", "40 + 2 = 42"],
  ["10:15:22", "Number Input (Limit)", "Output: 10"],
  ["10:15:22", "Greater Than", "42 > 10 = true"],
  ["10:15:22", "Branch", "Condition = true -> true path"],
  ["10:15:22", "Result", "Success (42)"],
];

const stateRows = [
  "Number Input (A)",
  "Number Input (B)",
  "Multiply",
  "Number Input (C)",
  "Add",
  "Number Input (Limit)",
  "Greater Than",
  "Branch",
  "Result (Success)",
];

export function BottomPanel() {
  return (
    <section className="bottom-panel">
      <div className="execution-log">
        <div className="tab-row">
          <button className="active" type="button">Execution Log</button>
          <button type="button">Results</button>
          <button type="button">Debug</button>
        </div>
        <div className="log-table">
          {logRows.map(([time, node, message]) => (
            <div className="log-row" key={`${time}-${node}`}>
              <span className="success-dot">o</span>
              <time>{time}</time>
              <strong>{node}</strong>
              <span>{message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="execution-state">
        <h2>Execution State</h2>
        {stateRows.map((row) => (
          <div className="state-row" key={row}>
            <span className="success-dot">o</span>
            <span>{row}</span>
            <strong>Success</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
