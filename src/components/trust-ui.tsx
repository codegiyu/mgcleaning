import Link from "next/link";
import { ArrowRight } from "@/components/site-ui";
import type { TrustFact } from "@/content/trust-content";

export function TrustProofCard({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article className="trust-proof-card">
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && linkLabel ? <Link className="text-link" href={href}>{linkLabel} <ArrowRight /></Link> : null}
    </article>
  );
}

export function TrustFactList({ facts }: { facts: TrustFact[] }) {
  return (
    <div className="trust-fact-list">
      {facts.map((fact) => (
        <div className="trust-fact-row" key={fact.id}>
          <span>{fact.label}</span>
          <strong>{fact.value ?? "To be confirmed"}</strong>
        </div>
      ))}
    </div>
  );
}
