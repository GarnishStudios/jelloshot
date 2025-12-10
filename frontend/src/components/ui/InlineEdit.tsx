import React, { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "time" | "textarea" | "number";
  className?: string;
  disabled?: boolean;
  suffix?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  placeholder = "Click to edit",
  type = "text",
  className = "",
  disabled = false,
  suffix,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== "textarea") {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, type]);

  const handleSave = () => {
    // Always call onSave for number fields, let the parent component handle validation
    if (type === "number" || editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Only save if the value actually changed (skip if already saved via Enter)
    if ((type === "number" || editValue !== value) && editValue !== value) {
      handleSave();
    } else {
      setIsEditing(false);
    }
  };

  const displayValue = value || placeholder;
  const displayText = suffix ? `${displayValue}${suffix}` : displayValue;
  const baseClasses = `${className} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/20"}`;

  if (disabled) {
    return <span className={`text-white ${className}`}>{displayText}</span>;
  }

  if (isEditing) {
    const defaultInputClasses =
      "bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm w-full min-w-0";
    const inputClasses = className.includes("w-full")
      ? `${defaultInputClasses} ${className}`
      : `${defaultInputClasses} ${className}`;

    if (type === "textarea") {
      return (
        <div>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`${inputClasses} w-full resize-none`}
            rows={3}
          />
        </div>
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClasses}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${baseClasses} ${!value ? "text-slate-400 italic" : "text-white"} inline-block min-w-[100px] px-2 py-1 rounded transition-colors bg-white/10 border border-white/20 overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
      title={displayText} // Show full text on hover
    >
      {displayText}
    </span>
  );
};
