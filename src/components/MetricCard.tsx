interface MetricCardProps {
  label: string;
  value: string;
  color: "accent" | "success" | "destructive" | "primary" | "warning";
}

const colorMap = {
  accent: "text-accent glow-accent",
  success: "text-success glow-success",
  destructive: "text-destructive glow-danger",
  primary: "text-primary",
  warning: "text-warning",
};

const MetricCard = ({ label, value, color }: MetricCardProps) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-secondary/50 min-w-[120px]">
    <span className="text-[0.65rem] font-bold tracking-[0.15em] text-muted-foreground uppercase">
      {label}
    </span>
    <strong className={`text-xl font-mono font-bold ${colorMap[color]}`}>
      {value}
    </strong>
  </div>
);

export default MetricCard;
