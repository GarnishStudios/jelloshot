import React, { useState, useRef, useEffect } from "react";

interface TimeInput12HourProps {
  value: string; // 24-hour format (HH:MM)
  onSave: (value: string) => void; // saves in 24-hour format
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const TimeInput12Hour: React.FC<TimeInput12HourProps> = ({
  value,
  onSave,
  placeholder = "Click to edit",
  className = "",
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert 24-hour to 12-hour format for display
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Convert 12-hour to 24-hour format for backend
  const convertTo24Hour = (time12: string): string => {
    if (!time12) return "";

    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = time12.trim().match(timeRegex);

    if (!match) return "";

    const [, hours, minutes, period] = match;
    let hour24 = parseInt(hours);

    if (period.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  // Parse user input and try to understand various formats
  const parseUserInput = (input: string): string => {
    if (!input.trim()) return "";

    let cleanInput = input.trim().toUpperCase();

    // If no AM/PM specified, assume based on typical times
    if (!/AM|PM/.test(cleanInput)) {
      const timeMatch = cleanInput.match(/^(\d{1,2}):?(\d{2})?$/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] || "00";

        // Smart AM/PM detection
        if (hour >= 1 && hour <= 11) {
          cleanInput = `${hour}:${minute} AM`;
        } else if (hour === 12) {
          cleanInput = `${hour}:${minute} PM`;
        } else if (hour >= 13 && hour <= 23) {
          // Convert 24-hour to 12-hour
          const hour12 = hour - 12;
          cleanInput = `${hour12}:${minute} PM`;
        } else if (hour === 0 || hour === 24) {
          cleanInput = `12:${minute} AM`;
        }
      }
    }

    // Handle formats like "9AM", "10:30PM", etc.
    const formatRegex = /^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i;
    const match = cleanInput.match(formatRegex);

    if (match) {
      const hour = match[1];
      const minute = match[2] || "00";
      const period = match[3].toUpperCase();
      return `${hour}:${minute} ${period}`;
    }

    return cleanInput;
  };

  useEffect(() => {
    setEditValue(convertTo12Hour(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const parsedInput = parseUserInput(editValue);
    const time24 = convertTo24Hour(parsedInput);

    if (time24 && time24 !== value) {
      onSave(time24);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(convertTo12Hour(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    const parsedInput = parseUserInput(editValue);
    const time24 = convertTo24Hour(parsedInput);

    if (time24 && time24 !== value) {
      onSave(time24);
    } else if (editValue !== convertTo12Hour(value)) {
      // If input is invalid or unchanged, revert
      setEditValue(convertTo12Hour(value));
    }
    setIsEditing(false);
  };

  const displayValue = value ? convertTo12Hour(value) : placeholder;
  const baseClasses = `${className} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/20"}`;

  if (disabled) {
    return <span className={`text-white ${className}`}>{displayValue}</span>;
  }

  if (isEditing) {
    const defaultInputClasses =
      "bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm w-full min-w-0";
    const inputClasses = className.includes("w-full")
      ? `${defaultInputClasses} ${className}`
      : `${defaultInputClasses} ${className}`;

    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClasses}
        placeholder="e.g., 9:00 AM, 2:30 PM"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${baseClasses} ${!value ? "text-slate-400 italic" : "text-white"} inline-block min-w-[100px] px-2 py-1 rounded transition-colors bg-white/10 border border-white/20 overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
      title={displayValue} // Show full text on hover
    >
      {displayValue}
    </span>
  );
};
