import { Fragment, type ReactNode } from "react";
import { InstagramIcon, PhoneIcon, WhatsAppIcon } from "@/components/site-ui";
import { businessContactFacts } from "@/content/public-content";
import { instagramDmHref, whatsappRequestHref } from "@/lib/contact/request-links";

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

type RequestChannel = { id: "whatsapp" | "instagram" | "phone"; href: string; label: string; detail: string; opens?: string; icon: ReactNode; external: boolean };

/** WhatsApp first, then an Instagram DM, then a call: the order agreed with M&G. */
export function requestChannels(service?: string): RequestChannel[] {
  const { whatsapp, instagram, phone } = businessContactFacts;
  const channels: (RequestChannel | null)[] = [
    whatsapp.href && phone.value ? { id: "whatsapp", href: whatsappRequestHref(whatsapp.href, service), label: "Message us on WhatsApp", detail: phone.value, opens: "opens WhatsApp", icon: <WhatsAppIcon />, external: true } : null,
    instagram.value ? { id: "instagram", href: instagramDmHref(instagram.value), label: "Send an Instagram DM", detail: instagram.value, opens: "opens Instagram", icon: <InstagramIcon />, external: true } : null,
    phone.href && phone.value ? { id: "phone", href: phone.href, label: "Call us", detail: phone.value, icon: <PhoneIcon />, external: false } : null,
  ];
  return channels.filter((channel): channel is RequestChannel => channel !== null);
}

/**
 * The primary way to request a cleaning. `buttons` is the bold stack used before the
 * booking form and in panels; `inline` is a compact row under FAQ answers. Pass a
 * service title from the services manifest to name it in the WhatsApp message. The
 * messaging channels (WhatsApp and Instagram) are highlighted; a call is the plain option.
 */
export function RequestChannels({ variant = "buttons", tone = "dark", service }: { variant?: "buttons" | "inline"; tone?: "dark" | "light"; service?: string }) {
  const channels = requestChannels(service);
  if (variant === "inline") {
    return (
      <p className="request-channels-inline">
        <span>Request by message:</span>
        {channels.map((channel) => (
          <a key={channel.id} className="text-link" href={channel.href} {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}>
            {channel.icon}{channel.id === "phone" ? `Call ${channel.detail}` : channel.id === "whatsapp" ? "WhatsApp" : "Instagram"}
            {channel.opens && <span className="sr-only"> ({channel.opens})</span>}
          </a>
        ))}
      </p>
    );
  }
  return (
    <ul className={"request-channels request-channels-" + tone}>
      {channels.map((channel) => (
        <li key={channel.id}>
          <a className={"request-channel" + (channel.id === "phone" ? "" : " request-channel-primary")} href={channel.href} {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}>
            <span className="request-channel-icon" aria-hidden="true">{channel.icon}</span>
            <span className="request-channel-text">
              <strong>{channel.label}</strong>
              <small>{channel.detail}</small>
            </span>
            {channel.opens && <span className="sr-only"> ({channel.opens})</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
