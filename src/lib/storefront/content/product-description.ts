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
