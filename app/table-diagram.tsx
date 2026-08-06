export function TableDiagram({ capacity }: { capacity: number }) {
  const size = 72;
  const center = size / 2;
  const ringRadius = center - 8;
  const gap = 0.35; // радианный зазор между дугами-местами
  const arcLength = (Math.PI * 2) / capacity - gap;

  const arcs = Array.from({ length: capacity }).map((_, i) => {
    const start = (i / capacity) * Math.PI * 2 - Math.PI / 2 + gap / 2;
    const end = start + arcLength;
    const x1 = center + ringRadius * Math.cos(start);
    const y1 = center + ringRadius * Math.sin(start);
    const x2 = center + ringRadius * Math.cos(end);
    const y2 = center + ringRadius * Math.sin(end);
    const largeArc = arcLength > Math.PI ? 1 : 0;
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${ringRadius} ${ringRadius} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={center}
        cy={center}
        r={ringRadius - 8}
        fill="none"
        className="stroke-text/18"
      />
      {arcs.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          className="stroke-accent"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
