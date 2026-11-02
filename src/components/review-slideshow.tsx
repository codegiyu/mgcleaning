"use client";

import * as React from "react";
import { ReviewCard, type ReviewCardData } from "@/components/review-card";

const AUTO_ADVANCE_MS = 6000;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={direction === "left" ? "m14 5-7 7 7 7" : "m10 5 7 7-7 7"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing
    ? <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6v12M15 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
    : <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" /></svg>;
}

/** Positions the track can rest at: one per card, minus the cards that share the last view. */
function stopCount(track: HTMLElement, slides: number) {
  const slide = track.firstElementChild as HTMLElement | null;
  if (!slide) return 1;
  const perView = Math.max(1, Math.round(track.clientWidth / slide.offsetWidth));
  return Math.max(1, slides - perView + 1);
}

/**
 * Reviews as a slideshow: a scroll-snap track (so phones swipe natively) with previous,
 * next, and position controls. It advances on its own unless the visitor prefers reduced
 * motion, pauses it, or is hovering over or focused inside it, and wraps from the end.
 */
export function ReviewSlideshow({ reviews }: { reviews: (ReviewCardData & { id: string })[] }) {
  const trackRef = React.useRef<HTMLUListElement>(null);
  const [position, setPosition] = React.useState(0);
  const [stops, setStops] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const [interacting, setInteracting] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(true);

  const goTo = React.useCallback((target: number) => {
    const track = trackRef.current;
    const slide = track?.children[target] as HTMLElement | undefined;
    if (!track || !slide) return;
    // The track is positioned, so a slide's offsetLeft is measured from the track's start.
    track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setStops(stopCount(track, reviews.length));
    const onScroll = () => {
      const slide = track.firstElementChild as HTMLElement | null;
      if (!slide) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setPosition(Math.round(track.scrollLeft / (slide.offsetWidth + gap)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, [reviews.length]);

  const current = Math.min(position, stops - 1);
  const autoAdvance = stops > 1 && !paused && !interacting && !reducedMotion;

  React.useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(current + 1 >= stops ? 0 : current + 1);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoAdvance, current, stops, goTo]);

  return (
    <div
      className="review-slideshow"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
    >
      <ul ref={trackRef} className="review-slideshow-track" aria-live={autoAdvance ? "off" : "polite"}>
        {reviews.map((review, index) => (
          <li key={review.id} className="review-slide" aria-roledescription="slide" aria-label={`${index + 1} of ${reviews.length}`}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
      {stops > 1 && (
        <div className="review-slideshow-controls">
          {!reducedMotion && (
            <button className="review-slideshow-button" type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play the reviews slideshow" : "Pause the reviews slideshow"}>
              <PlayPauseIcon playing={!paused} />
            </button>
          )}
          <div className="review-slideshow-dots">
            {Array.from({ length: stops }, (_, index) => (
              <button key={index} className="review-slideshow-dot" type="button" onClick={() => goTo(index)} aria-label={`Show review ${index + 1}`} aria-current={index === current ? "true" : undefined} />
            ))}
          </div>
          <button className="review-slideshow-button" type="button" onClick={() => goTo(current - 1 < 0 ? stops - 1 : current - 1)} aria-label="Previous review"><Chevron direction="left" /></button>
          <button className="review-slideshow-button" type="button" onClick={() => goTo(current + 1 >= stops ? 0 : current + 1)} aria-label="Next review"><Chevron direction="right" /></button>
        </div>
      )}
    </div>
  );
}
