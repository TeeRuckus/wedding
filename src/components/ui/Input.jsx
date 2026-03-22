import React from 'react';

/**
 * Styled text input with label and optional error message.
 */
export default function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  autoComplete,
  id,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-medium text-stone-500 mb-2 tracking-[0.15em] uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 border rounded-sm bg-white text-stone-800
                    font-sans text-base tracking-wide
                    placeholder:text-stone-300 placeholder:tracking-wide
                    focus:outline-none focus:border-wedding-black focus:ring-1 focus:ring-wedding-black/10
                    transition-colors duration-200
                    ${error ? 'border-red-400' : 'border-stone-200'}`}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 tracking-wide">{error}</p>
      )}
    </div>
  );
}
