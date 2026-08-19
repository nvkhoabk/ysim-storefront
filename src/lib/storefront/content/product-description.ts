import sanitizeHtml from "sanitize-html";

const namedHtmlEntities: Readonly<Record<string, string>> = {
  amp: "&",
  apos: "'",
  bull: "•",
  copy: "©",
  gt: ">",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  middot: "·",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  raquo: "»",
  rdquo: "”",
  reg: "®",
  rsquo: "’",
  trade: "™",
};

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi,
    (source, entity: string) => {
      const normalized = entity.toLowerCase();
      if (!normalized.startsWith("#")) {
        return namedHtmlEntities[normalized] ?? source;
      }

      const hexadecimal = normalized.startsWith("#x");
      const codePoint = Number.parseInt(
        normalized.slice(hexadecimal ? 2 : 1),
        hexadecimal ? 16 : 10,
      );
      if (
        !Number.isInteger(codePoint) ||
        codePoint < 0 ||
        codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
      ) {
        return source;
      }
      return String.fromCodePoint(codePoint);
    },
  );
}

const productDescriptionTags = [
  "a",
  "b",
  "blockquote",
  "br",
  "caption",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
] as const;

function sanitizeProductDescriptionHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [...productDescriptionTags],
    allowedAttributes: {
      "*": ["class", "title"],
      a: ["href", "rel", "target"],
      img: ["alt", "height", "loading", "src", "width"],
      td: ["colspan", "headers", "rowspan"],
      th: ["colspan", "headers", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    parser: {
      decodeEntities: true,
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs:
          attribs.target === "_blank"
            ? { ...attribs, rel: "noopener noreferrer" }
            : attribs,
      }),
    },
  });
}

export function normalizeProductDescriptionText(
  value: string | undefined,
): string {
  const withoutMarkup = (value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:article|div|h[1-6]|li|p|section|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  let decoded = withoutMarkup;
  for (let pass = 0; pass < 2; pass += 1) {
    decoded = decodeHtmlEntities(decoded);
  }

  return decoded
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ +([,.;:!?])/g, "$1")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * WooCommerce returns rendered HTML for the long product description.
 * Preserve its editorial structure while removing active markup and inline
 * execution hooks before it is rendered by the trusted storefront component.
 */
export function normalizeProductDescriptionHtml(
  value: string | undefined,
): string {
  const normalizedEntities = (value || "").replace(
    /&amp;#(x[0-9a-f]+|\d+);/gi,
    "&#$1;",
  );

  return sanitizeProductDescriptionHtml(normalizedEntities)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .trim();
}
