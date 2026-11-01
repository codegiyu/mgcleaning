import type { TrustFact } from "@/content/trust-content";

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
