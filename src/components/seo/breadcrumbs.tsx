import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/site-seo";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.path}>
            {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

