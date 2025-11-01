"use client";

import { useState, useEffect } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className = "",
  required = false
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Format phone number for display
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // If it starts with 1, remove it (we'll add +1 prefix)
    const cleanDigits = digits.startsWith('1') ? digits.slice(1) : digits;
    
    // Format as (XXX) XXX-XXXX
    if (cleanDigits.length === 0) return '';
    if (cleanDigits.length <= 3) return `(${cleanDigits}`;
    if (cleanDigits.length <= 6) return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3)}`;
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 10)}`;
  };

  // Convert display value to full phone number with +1
  const getFullPhoneNumber = (displayValue: string) => {
    const digits = displayValue.replace(/\D/g, '');
    return digits.length === 10 ? `+1${digits}` : `+1${digits}`;
  };

  // Initialize display value from prop
  useEffect(() => {
    if (value) {
      // Remove +1 prefix if present
      const cleanValue = value.startsWith('+1') ? value.slice(2) : value;
      setDisplayValue(formatPhoneNumber(cleanValue));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setDisplayValue(formatted);
    
    // Convert to full phone number and call onChange
    const fullNumber = getFullPhoneNumber(formatted);
    onChange(fullNumber);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const isValid = displayValue.replace(/\D/g, '').length === 10;

  return (
    <div className="relative">
      <div className="flex items-center">
        <span className="absolute left-4 text-foreground/60 text-sm font-medium">+1</span>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          maxLength={14} // (XXX) XXX-XXXX
          className={`w-full pl-10 pr-10 py-3 glass rounded-[19px] border text-sm text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${
            displayValue && !isValid ? 'border-destructive/50 bg-destructive/5' : 
            isValid ? 'border-green-400/50 bg-green-400/5' : 
            'border-border/50 bg-input'
          } ${className}`}
        />
        
        {/* Validation status */}
        {displayValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Validation message */}
      {displayValue && !isValid && (
        <div className="mt-1 text-xs text-destructive flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please enter a valid 10-digit phone number
        </div>
      )}

      {/* Success message */}
      {isValid && (
        <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Valid phone number: +1{displayValue.replace(/\D/g, '')}
        </div>
      )}
    </div>
  );
}
