type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const line of body.split(/\r?\n/)) {
    const heading = /^(#{1,2})\s+(.+)$/.exec(line.trim());
    const bullet = /^-\s+(.+)$/.exec(line.trim());
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1]!.length === 1 ? 2 : 3, text: heading[2]! });
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1]!);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

function inlineText(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export function PlainArticleBody({ body }: { body: string }) {
  return (
    <div className="article-body">
      {parseBlocks(body).map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2
            ? <h2 key={index}>{inlineText(block.text)}</h2>
            : <h3 key={index}>{inlineText(block.text)}</h3>;
        }
        if (block.type === "list") return <ul key={index}>{block.items.map((item) => <li key={item}>{inlineText(item)}</li>)}</ul>;
        return <p key={index}>{inlineText(block.text)}</p>;
      })}
    </div>
  );
}
