"use client";

import "client-only";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

type RevealDirection = "up" | "left" | "right" | "scale";

const revealTargets: Array<{ selector: string; direction: RevealDirection }> = [
  { selector: ".home-hero .hero-copy", direction: "left" },
  { selector: ".home-hero .hero-visual", direction: "right" },
  { selector: ".trust-strip-inner", direction: "up" },
  { selector: ".page-intro", direction: "up" },
  { selector: ".section-heading", direction: "up" },
  { selector: ".why-mg-card", direction: "up" },
  { selector: ".trust-proof-card", direction: "up" },
  { selector: ".faq-preview-heading", direction: "up" },
  { selector: ".faq-preview-item", direction: "up" },
  { selector: ".service-card", direction: "up" },
  { selector: ".approach-visual", direction: "left" },
  { selector: ".approach-copy", direction: "right" },
  { selector: ".article-card", direction: "up" },
  { selector: ".cta-panel", direction: "up" },
  { selector: ".about-illustration", direction: "left" },
  { selector: ".about-copy", direction: "right" },
  { selector: ".process-heading", direction: "left" },
  { selector: ".process-step", direction: "up" },
  { selector: ".services-intro-support", direction: "up" },
  { selector: ".service-group-heading", direction: "up" },
  { selector: ".service-detail-main", direction: "left" },
  { selector: ".service-detail-aside", direction: "right" },
  { selector: ".category-tabs", direction: "up" },
  { selector: ".gallery-item", direction: "scale" },
  { selector: ".gallery-booking", direction: "up" },
  { selector: ".faq-item", direction: "up" },
  { selector: ".trust-next-step", direction: "up" },
  { selector: ".area-availability-card", direction: "up" },
  { selector: ".area-notes > div", direction: "up" },
  { selector: ".contact-aside", direction: "left" },
  { selector: ".contact-form", direction: "right" },
  { selector: ".legal-page", direction: "up" },
  { selector: ".article-head", direction: "up" },
  { selector: ".article-cover-image", direction: "scale" },
  { selector: ".article-hero-art", direction: "scale" },
  { selector: ".article-body", direction: "up" },
  { selector: ".article-footer-cta", direction: "up" },
  { selector: ".link-hub-page > *", direction: "up" },
];

function resetRevealTarget(element: HTMLElement) {
  element.removeAttribute("data-scroll-reveal");
  element.classList.remove("scroll-reveal-visible");
  element.style.removeProperty("--scroll-reveal-delay");
}

export function ScrollRevealController() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const pageRoot = document.querySelector<HTMLElement>("main");
    const documentRoot = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!pageRoot || reducedMotion || !("IntersectionObserver" in window)) return;

    const targets: HTMLElement[] = [];
    const seen = new Set<HTMLElement>();
    const siblingPositions = new Map<Element, number>();
    const initialViewportLimit = window.innerHeight * 0.94;

    for (const { selector, direction } of revealTargets) {
      pageRoot.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);

        const bounds = element.getBoundingClientRect();
        if (bounds.top <= initialViewportLimit) return;

        const parent = element.parentElement ?? pageRoot;
        const siblingPosition = siblingPositions.get(parent) ?? 0;
        siblingPositions.set(parent, siblingPosition + 1);

        element.dataset.scrollReveal = direction;
        element.style.setProperty(
          "--scroll-reveal-delay",
          `${Math.min(siblingPosition, 5) * 90}ms`,
        );
        targets.push(element);
      });
    }

    documentRoot.classList.add("scroll-reveal-enabled");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          element.classList.add("scroll-reveal-visible");
          element.addEventListener("animationend", () => resetRevealTarget(element), { once: true });
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      targets.forEach(resetRevealTarget);
      documentRoot.classList.remove("scroll-reveal-enabled");
    };
  }, [pathname]);

  return null;
}
