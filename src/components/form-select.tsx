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

/**
 * A styled native select. The browser handles required-field validation, keyboard use,
 * screen readers, and the phone's own picker; form reset restores `defaultValue`.
 * (The previous custom listbox kept its value in a read-only input, which browsers
 * never validate, so required choices could be skipped.)
 */
export function FormSelect({ id, name, label, placeholder, options, defaultValue = "", required = false }: FormSelectProps) {
  return (
    <div className="form-select">
      <label htmlFor={id}>{label}</label>
      <span className="form-select-control">
        <select id={id} name={name} defaultValue={defaultValue} required={required}>
          <option value="" disabled={required}>{placeholder}</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </div>
  );
}
