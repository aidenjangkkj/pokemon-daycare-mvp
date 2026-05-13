interface StatusPanelProps {
  label: string;
  value: number;
  colorClassName?: string;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function StatusPanel({
  label,
  value,
  colorClassName = "bg-lime-500",
}: StatusPanelProps) {
  const safeValue = clamp(value);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <span className="font-bold text-[clamp(20px,1.6vw,28px)]">{label}</span>
      <span className="font-bold text-[clamp(20px,1.6vw,28px)]">{safeValue}</span>
      <div className="col-span-2 h-5 border-2 border-border bg-muted p-[2px]">
        <div
          className={`h-full ${colorClassName}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
