export default function StatBar({ label, value }) {
  return (
    <div className="spec-row">
      <span className="spec-name">{label}</span>
      <div className="spec-track">
        <div className="spec-fill" style={{ width: `${value * 10}%` }} />
      </div>
      <span className="spec-val">{value}</span>
    </div>
  );
}
