"use client";

import { useEffect, useRef, useState } from "react";

export type FormSelectOption = { value: string; label: string };

type FormSelectProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: FormSelectOption[];
  defaultValue?: string;
  required?: boolean;
};

export function FormSelect({ id, name, label, placeholder, options, defaultValue = "", required = false }: FormSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const reset = () => {
      setValue(defaultValue);
      setOpen(false);
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue]);

  function choose(nextValue: string) {
    setValue(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="form-select" ref={rootRef}>
      <label htmlFor={id}>{label}</label>
      <input className="form-select-value" name={name} value={value} readOnly tabIndex={-1} aria-hidden="true" required={required} />
      <button
        ref={triggerRef}
        id={id}
        className="form-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <span className={selected ? undefined : "form-select-placeholder"}>{selected?.label ?? placeholder}</span>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="form-select-menu" role="listbox" aria-labelledby={id}>
          {options.map((option) => (
            <button
              className="form-select-option"
              type="button"
              role="option"
              aria-selected={value === option.value}
              key={option.value}
              onClick={() => choose(option.value)}
            >
              <span>{option.label}</span>
              {value === option.value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
