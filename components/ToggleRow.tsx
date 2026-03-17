import React from "react";

interface Props {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

export default function ToggleRow({ label, description, checked, onToggle }: Props) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-teal-600" : "bg-gray-300"
        }`}
        onClick={onToggle}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}
