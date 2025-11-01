"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function ToggleSwitch({ 
  checked, 
  onChange, 
  disabled = false, 
  label,
  size = "md" 
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-11 h-6", 
    lg: "w-14 h-8"
  };

  const thumbSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  const translateClasses = {
    sm: checked ? "translate-x-4" : "translate-x-0",
    md: checked ? "translate-x-5" : "translate-x-0", 
    lg: checked ? "translate-x-6" : "translate-x-0"
  };

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          ${checked ? 'bg-blue-500' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        `}
      >
        <span
          className={`
            ${thumbSizeClasses[size]}
            ${translateClasses[size]}
            bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out
          `}
        />
      </button>
    </div>
  );
}
