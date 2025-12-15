"use client";

type Props = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: Props) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}
