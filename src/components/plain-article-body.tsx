import Link from "next/link";
import { parseArticleBody, type Inline } from "@/lib/blog/article-body";

function InlineText({ parts }: { parts: Inline[] }) {
  return parts.map((part, index) => {
    if (part.type === "strong") return <strong key={index}>{part.text}</strong>;
    if (part.type === "em") return <em key={index}>{part.text}</em>;
    if (part.type === "link") {
      return part.external
        ? <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>
        : <Link key={index} href={part.href}>{part.text}</Link>;
    }
    return part.text;
  });
}

/** Renders an article's plain-text body; see `src/lib/blog/article-body.ts` for the format. */
export function PlainArticleBody({ body }: { body: string }) {
  return (
    <div className="article-body">
      {parseArticleBody(body).map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2
            ? <h2 key={index}><InlineText parts={block.inline} /></h2>
            : <h3 key={index}><InlineText parts={block.inline} /></h3>;
        }
        if (block.type === "list") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineText parts={item} /></li>)}</ul>;
        return <p key={index}><InlineText parts={block.inline} /></p>;
      })}
    </div>
  );
}
