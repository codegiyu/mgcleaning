"use client";

import { useRef, useState, type FormEvent } from "react";
import { demoSite } from "@/content/demo-content";
import { callApi } from "@/lib/api/callApi";
import { FormSelect } from "@/components/form-select";
import { TurnstileField } from "@/components/turnstile-field";

type FormStatus = "idle" | "submitting" | "success" | "saved-without-notification" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const pendingRef = useRef(false);
  const submissionKeyRef = useRef<string | null>(null);

  function getSubmissionKey() {
    if (submissionKeyRef.current) return submissionKeyRef.current;
    try {
      submissionKeyRef.current = window.sessionStorage.getItem("mg-contact-idempotency-key") ?? crypto.randomUUID();
      window.sessionStorage.setItem("mg-contact-idempotency-key", submissionKeyRef.current);
    } catch {
      submissionKeyRef.current = crypto.randomUUID();
    }
    return submissionKeyRef.current;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const getValue = (key: string) => String(formData.get(key) ?? "").trim();
    const email = getValue("email");
    const payload = {
      name: getValue("name"),
      phone: getValue("phone"),
      inquiryType: "contact" as const,
      topic: getValue("topic"),
      companyWebsite: getValue("companyWebsite"),
      message: getValue("message"),
      ...(getValue("turnstileToken") ? { turnstileToken: getValue("turnstileToken") } : {}),
      ...(email ? { email } : {}),
    };

    pendingRef.current = true;
    setStatus("submitting");
    try {
      const result = await callApi("POST_CREATE_INQUIRY", {
        payload,
        headers: { "Idempotency-Key": getSubmissionKey() },
      });
      if (result.type === "error") {
        setStatus("error");
        return;
      }
      form.reset();
      try { window.sessionStorage.removeItem("mg-contact-idempotency-key"); } catch { /* Storage may be unavailable. */ }
      submissionKeyRef.current = null;
      setStatus(result.data.notificationQueued ? "success" : "saved-without-notification");
    } catch {
      setStatus("error");
    } finally {
      pendingRef.current = false;
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-busy={status === "submitting"}>
      <div>
        <h2 className="form-title">How can we help?</h2>
        <p className="form-demo-note">For questions, existing visits, partnerships, or anything you want to clarify before booking.</p>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" maxLength={120} required placeholder="e.g. Ada Okafor" /></div>
        <div className="form-field"><label htmlFor="contact-phone">Phone number</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} required placeholder="+234 ..." /></div>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="contact-email">Email address <span>(optional)</span></label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={320} placeholder="you@example.com" /></div>
        <FormSelect id="contact-topic" name="topic" label="What is this about?" placeholder="Choose a topic" required options={[{ value: "General question", label: "General question" }, { value: "Existing booking", label: "Existing booking" }, { value: "Partnership", label: "Partnership" }, { value: "Feedback", label: "Feedback" }]} />
      </div>
      <div className="form-field"><label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" minLength={8} maxLength={4000} required placeholder="Tell us what you would like to know." /></div>
      <div className="form-honeypot" aria-hidden="true"><label htmlFor="contact-company-website">Company website</label><input id="contact-company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" /></div>
      <TurnstileField />
      <button className="button button-dark form-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span></button>
      {status === "success" && <p className="form-confirmation" role="status">Thanks. Your message has been received, and the M&amp;G team can follow up using the details you shared.</p>}
      {status === "saved-without-notification" && <p className="form-confirmation" role="status">Your message was saved, but its email alert could not be queued. Please also <a href={demoSite.whatsappUrl} target="_blank" rel="noreferrer">message MG on WhatsApp</a> or call <a href={demoSite.phoneUrl}>{demoSite.phoneNumber}</a> so the team sees it.</p>}
      {status === "error" && <p className="form-error" role="alert">We couldn&apos;t send your message. Please try <a href={demoSite.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a> or call <a href={demoSite.phoneUrl}>{demoSite.phoneNumber}</a>.</p>}
    </form>
  );
}
