"use client";

import * as React from "react";
import Image from "next/image";

export type GalleryItem =
  | { id: string; type: "image"; src: string; alt: string; layout: string; serviceSlug?: string; tags?: string[]; disclosure?: string; caption?: string }
  | { id: string; type: "video"; src: string; poster?: string; alt: string; label?: string; layout: string; serviceSlug?: string; tags?: string[]; disclosure?: string; caption?: string };

function Chevron({ direction }: { direction: "left" | "right" }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={direction === "left" ? "m14 5-7 7 7 7" : "m10 5 7 7-7 7"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function GridMedia({ item }: { item: GalleryItem }) {
  if (item.type === "video") {
    return <video className="gallery-media" preload="metadata" poster={item.poster} aria-label={item.alt}><source src={item.src} /></video>;
  }
  return <Image className="gallery-media" src={item.src} alt={item.alt} fill sizes="(max-width: 650px) 100vw, (max-width: 900px) 50vw, 60vw" />;
}

function LightboxMedia({ item }: { item: GalleryItem }) {
  if (item.type === "video") {
    return <video className="gallery-lightbox-video" controls autoPlay playsInline poster={item.poster} aria-label={item.label}><source src={item.src} /></video>;
  }
  return <Image className="gallery-lightbox-image" src={item.src} alt={item.alt} fill sizes="90vw" priority />;
}

export function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const categories = ["All", ...Array.from(new Set(items.flatMap((item) => item.tags ?? [])))];
  const visibleItems = selectedCategory === "All" ? items : items.filter((item) => item.tags?.includes(selectedCategory));
  const activeItem = activeIndex === null ? null : visibleItems[activeIndex];

  React.useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((index) => index === null ? null : (index - 1 + visibleItems.length) % visibleItems.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => index === null ? null : (index + 1) % visibleItems.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, visibleItems.length]);

  return (
    <>
      <nav className="gallery-filters" aria-label="Filter gallery by service">
        {categories.map((category) => <button className={selectedCategory === category ? "gallery-filter gallery-filter-active" : "gallery-filter"} type="button" key={category} onClick={() => { setSelectedCategory(category); setActiveIndex(null); }}>{category}</button>)}
      </nav>
      <div className="gallery-grid">
        {visibleItems.map((item, index) => (
          <button className={`gallery-item gallery-item-${item.layout}`} key={item.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Open gallery item: ${item.alt}`}>
            <GridMedia item={item} />
            {item.tags?.[0] ? <span className="gallery-category">{item.tags[0]}</span> : null}
            {item.disclosure ? <span className="gallery-disclosure">{item.disclosure}</span> : null}
            {item.caption ? <span className="gallery-caption">{item.caption}</span> : null}
          </button>
        ))}
      </div>
      {activeItem && activeIndex !== null && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Gallery viewer">
          <button className="gallery-lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Close gallery viewer"><CloseIcon /></button>
          <button className="gallery-lightbox-control gallery-lightbox-prev" type="button" onClick={() => setActiveIndex((index) => index === null ? null : (index - 1 + visibleItems.length) % visibleItems.length)} aria-label="Previous gallery item"><Chevron direction="left" /></button>
          <div className="gallery-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <LightboxMedia item={activeItem} />
            {activeItem.caption ? <p className="gallery-lightbox-caption">{activeItem.caption}</p> : null}
            <span className="gallery-lightbox-count">{activeIndex + 1} / {visibleItems.length}</span>
          </div>
          <button className="gallery-lightbox-control gallery-lightbox-next" type="button" onClick={() => setActiveIndex((index) => index === null ? null : (index + 1) % visibleItems.length)} aria-label="Next gallery item"><Chevron direction="right" /></button>
        </div>
      )}
    </>
  );
}
