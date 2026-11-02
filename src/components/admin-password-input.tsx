"use client";

import { useState, type InputHTMLAttributes } from "react";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      {!open && <path d="m4 4 16 16" />}
    </svg>
  );
}

/**
 * A password input with a show/hide button. Takes the usual input props (controlled or
 * named for FormData); the button is type="button" so it never submits the form.
 */
export function AdminPasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="admin-password-control">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        className="admin-password-toggle"
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        <EyeIcon open={visible} />
      </button>
    </span>
  );
}
