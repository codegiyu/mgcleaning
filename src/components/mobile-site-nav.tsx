"use client";

import * as React from "react";
import Link from "next/link";

function MenuIcon({ close = false }: { close?: boolean }) {
  return close ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  );
}

export function MobileSiteNav() {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  return (
    <div className="mobile-site-nav">
      <button className="mobile-menu-toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <MenuIcon close={open} />
      </button>
      {open && (
        <div className="mobile-site-menu">
          <nav aria-label="Mobile navigation">
            <Link href="/services" onClick={close}>Services <span aria-hidden="true">→</span></Link>
            <Link href="/about" onClick={close}>Our approach <span aria-hidden="true">→</span></Link>
            <Link href="/blog" onClick={close}>Journal <span aria-hidden="true">→</span></Link>
            <Link href="/gallery" onClick={close}>Gallery <span aria-hidden="true">→</span></Link>
            <Link href="/faq" onClick={close}>FAQs <span aria-hidden="true">→</span></Link>
            <Link href="/areas" onClick={close}>Service areas <span aria-hidden="true">→</span></Link>
            <Link href="/contact" onClick={close}>Contact <span aria-hidden="true">→</span></Link>
          </nav>
          <div className="mobile-menu-footer">
            <span>Professional cleaning. Thoughtfully done.</span>
            <Link className="mobile-menu-cta" href="/book" onClick={close}>Request a cleaning <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      )}
    </div>
  );
}
