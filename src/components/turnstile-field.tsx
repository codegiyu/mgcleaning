"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileWidgetOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileWidgetOptions) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const enabled = process.env.NEXT_PUBLIC_TURNSTILE_MODE === "on";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function TurnstileField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");

  const renderWidget = useCallback(() => {
    if (!enabled || !siteKey || !window.turnstile || !containerRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: setToken,
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
  }, []);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
    };
  }, [renderWidget]);

  if (!enabled) return null;

  return (
    <div className="turnstile-field">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" onLoad={renderWidget} />
      <div ref={containerRef} aria-label="Human verification" />
      <input type="hidden" name="turnstileToken" value={token} />
    </div>
  );
}
