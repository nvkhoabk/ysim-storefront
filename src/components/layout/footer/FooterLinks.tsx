import Link from "next/link";

interface FooterLinkItem {
  title: string;
  href: string;
}

interface FooterLinksProps {
  title: string;
  items: ReadonlyArray<FooterLinkItem>;
}

export function FooterLinks({
  title,
  items,
}: FooterLinksProps) {
  return (
    <nav aria-label={title}>
      <h2
        className="
          text-[13px]
          font-bold
          uppercase
          tracking-wide
          text-green-700
        "
      >
        {title}
      </h2>

      <ul className="mt-5 space-y-3.5">
        {items.map((item) => (
          <li key={`${title}-${item.href}`}>
            <Link
              href={item.href}
              className="
                inline-flex
                text-[13px]
                leading-5
                text-slate-700
                transition
                hover:translate-x-0.5
                hover:text-green-700
                focus-visible:rounded-sm
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
              "
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}