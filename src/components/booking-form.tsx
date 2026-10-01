"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { demoSite, services } from "@/content/demo-content";
import { callApi } from "@/lib/api/callApi";
import { FormSelect } from "@/components/form-select";
import { TurnstileField } from "@/components/turnstile-field";

type FormStatus = "idle" | "submitting" | "success" | "saved-without-notification" | "error";

export function BookingForm({ initialService = "" }: { initialService?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const pendingRef = useRef(false);
  const submissionKeyRef = useRef<string | null>(null);

  function getSubmissionKey() {
    if (submissionKeyRef.current) return submissionKeyRef.current;
    try {
      submissionKeyRef.current = window.sessionStorage.getItem("mg-booking-idempotency-key") ?? crypto.randomUUID();
      window.sessionStorage.setItem("mg-booking-idempotency-key", submissionKeyRef.current);
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
      inquiryType: "booking" as const,
      serviceInterest: getValue("serviceInterest"),
      preferredDate: getValue("preferredDate"),
      preferredTime: getValue("preferredTime"),
      location: getValue("location"),
      spaceType: getValue("spaceType"),
      preferredContactMethod: getValue("preferredContactMethod") as "phone" | "whatsapp" | "either",
      companyWebsite: getValue("companyWebsite"),
      message: getValue("message"),
      ...(getValue("turnstileToken") ? { turnstileToken: getValue("turnstileToken") } : {}),
      email,
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
      try { window.sessionStorage.removeItem("mg-booking-idempotency-key"); } catch { /* Storage may be unavailable. */ }
      submissionKeyRef.current = null;
      router.replace(`/book/confirmation?reference=${encodeURIComponent(result.data.reference)}`);
    } catch {
      setStatus("error");
    } finally {
      pendingRef.current = false;
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-busy={status === "submitting"}>
      <div>
        <h2 className="form-title">Plan your cleaning visit.</h2>
        <p className="form-demo-note">Submit a cleaning request and our team will contact you to confirm availability and pricing. We respond within one business day.</p>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="booking-name">Your name</label><input id="booking-name" name="name" autoComplete="name" maxLength={120} required placeholder="e.g. Chinedu Adeyemi Musa" /></div>
        <div className="form-field"><label htmlFor="booking-phone">Phone number</label><input id="booking-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} required placeholder="+234 ..." /></div>
      </div>
      <div className="form-field"><label htmlFor="booking-email">Email address</label><input id="booking-email" name="email" type="email" autoComplete="email" maxLength={320} required placeholder="you@example.com" /></div>
      <div className="form-row">
        <FormSelect id="booking-service" name="serviceInterest" label="Service needed" placeholder="Choose a service" required defaultValue={initialService} options={services.map((service) => ({ value: service.title, label: service.title }))} />
        <FormSelect id="booking-space-type" name="spaceType" label="Space type" placeholder="Choose a space" required options={[{ value: "Home", label: "Home" }, { value: "Office", label: "Office" }, { value: "Commercial space", label: "Commercial space" }, { value: "Short-let", label: "Short-let" }, { value: "Post-construction site", label: "Post-construction site" }, { value: "Other", label: "Other" }]} />
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="booking-date">Preferred date</label><input id="booking-date" name="preferredDate" type="date" required /></div>
        <FormSelect id="booking-time" name="preferredTime" label="Preferred time" placeholder="Choose a time" required options={[{ value: "Morning (8am–12pm)", label: "Morning (8am–12pm)" }, { value: "Afternoon (12pm–4pm)", label: "Afternoon (12pm–4pm)" }, { value: "Late afternoon (4pm–7pm)", label: "Late afternoon (4pm–7pm)" }]} />
      </div>
      <FormSelect id="booking-contact-method" name="preferredContactMethod" label="How should we follow up?" placeholder="Choose a contact method" required options={[{ value: "phone", label: "Phone call" }, { value: "whatsapp", label: "WhatsApp" }, { value: "either", label: "Phone or WhatsApp" }]} />
      <div className="form-field"><label htmlFor="booking-location">Service location or area</label><input id="booking-location" name="location" maxLength={240} required placeholder="e.g. Wuse 2, Abuja" /></div>
      <div className="form-field"><label htmlFor="booking-message">Tell us about the space</label><textarea id="booking-message" name="message" minLength={8} maxLength={4000} required placeholder="Rooms, surfaces, pest concerns, access notes, priorities, or anything else we should know." /></div>
      <div className="form-honeypot" aria-hidden="true"><label htmlFor="booking-company-website">Company website</label><input id="booking-company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" /></div>
      <TurnstileField />
      <button className="button button-dark form-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending…" : "Submit cleaning request"} <span aria-hidden="true">↗</span></button>
      {status === "error" && <p className="form-error" role="alert">We couldn&apos;t send your booking request. Please try <a href={demoSite.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a> or call <a href={demoSite.phoneUrl}>{demoSite.phoneNumber}</a>.</p>}
    </form>
  );
}
