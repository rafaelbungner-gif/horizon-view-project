interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ControlSlider = ({ label, value, min, max, step, unit = "", onChange }: ControlSliderProps) => {
  const update = (rawValue: number) => {
    if (Number.isFinite(rawValue)) {
      onChange(clamp(rawValue, min, max));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center gap-3">
        <label className="text-sm text-muted-foreground font-medium">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => update(event.currentTarget.valueAsNumber)}
            className="w-20 bg-secondary border border-border rounded-md px-2 py-1 text-right text-sm font-mono font-bold text-foreground focus:border-accent focus:outline-none"
          />
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => update(event.currentTarget.valueAsNumber)}
        className="w-full accent-accent cursor-pointer"
        aria-label={label}
      />
    </div>
  );
};

export default ControlSlider;
