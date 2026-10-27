import { Fragment, type ReactNode } from "react";
import { businessContactFacts } from "@/content/public-content";

type Channel = "instagram" | "phone" | "email" | "hours";

/** Contact details from the governed facts manifest, shared by the Contact and Book pages. */
export function ContactChannels({ channels, children }: { channels: Channel[]; children?: ReactNode }) {
  const { instagram, phone, whatsapp, email, operatingHours, responseExpectation } = businessContactFacts;
  const blocks: Record<Channel, ReactNode> = {
    instagram: (
      <ContactBlock label={instagram.label} note="See M&G Cleaning Services work and updates">
        <a href={instagram.href} target="_blank" rel="noreferrer">{instagram.value}</a>
      </ContactBlock>
    ),
    phone: (
      <ContactBlock label="Call or WhatsApp" note="Use the same number for calls and WhatsApp">
        <a href={phone.href}>{phone.value}</a><a href={whatsapp.href}>WhatsApp</a>
      </ContactBlock>
    ),
    email: (
      <ContactBlock label={email.label} note="The official inbox will be added when M&G Cleaning Services supplies it.">
        {email.value ?? "To be confirmed"}
      </ContactBlock>
    ),
    hours: (
      <ContactBlock label={operatingHours.label} note={responseExpectation.value}>
        {operatingHours.value ?? "To be confirmed"}
      </ContactBlock>
    ),
  };
  return <>{channels.map((channel) => <Fragment key={channel}>{blocks[channel]}</Fragment>)}{children}</>;
}

export function ContactBlock({ label, note, children }: { label: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="contact-info-block">
      <span>{label.toUpperCase()}</span>
      <strong>{children}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
