/**
 * Allowlist HTML sanitizer for blog article bodies (server-side, no dependencies).
 *
 * The editor only produces a known set of tags, so anything outside that set is
 * dropped (its text is kept), dangerous containers (script, style, iframe…) are
 * dropped with their contents, every attribute is validated against a per-tag
 * allowlist, and URLs must be http(s), mailto, tel or relative.
 */

const TAGS: Record<string, string[]> = {
  p: ["style"],
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  h5: ["style"],
  h6: ["style"],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  strike: [],
  code: [],
  pre: [],
  span: [],
  blockquote: [],
  ul: [],
  ol: ["start"],
  li: [],
  br: [],
  hr: [],
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "data-align", "data-width", "data-caption", "style"],
  figure: ["class", "data-align"],
  figcaption: [],
  table: ["style"],
  colgroup: [],
  col: ["style", "span"],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ["colspan", "rowspan", "colwidth", "style", "data-bg"],
  td: ["colspan", "rowspan", "colwidth", "style", "data-bg"],
};

const VOID = new Set(["br", "hr", "img", "col"]);
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "noscript", "template", "textarea", "select", "svg", "math", "title",
]);

const TOKEN =
  /<!--[\s\S]*?-->|<\/?[a-zA-Z][a-zA-Z0-9-]*(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const escapeAttr = (v: string) =>
  v.replace(/&(?!(?:amp|lt|gt|quot|#\d+|#x[0-9a-f]+);)/gi, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Decode entities that could hide a URL scheme, so "java&#115;cript:" is caught. */
function decodeForCheck(v: string) {
  return v
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&(colon|tab|newline);?/gi, (_, n) => ({ colon: ":", tab: "", newline: "" })[n.toLowerCase() as "colon"]);
}

function safeUrl(value: string, allowMail: boolean): string | null {
  const cleaned = decodeForCheck(value).replace(/[\u0000- \u007f-\u009f]/g, "");
  if (!cleaned) return null;
  const scheme = cleaned.match(/^([a-z][a-z0-9+.-]*):/i);
  if (!scheme) return value.trim(); // relative or fragment
  const s = scheme[1].toLowerCase();
  if (s === "http" || s === "https") return value.trim();
  if (allowMail && (s === "mailto" || s === "tel")) return value.trim();
  return null;
}

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.\s,%]+\))$/i;
const LENGTH = /^(auto|\d+(\.\d+)?(%|px|em|rem))$/i;

function safeStyle(value: string): string {
  const out: string[] = [];
  for (const decl of value.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim().toLowerCase();
    const val = decl.slice(i + 1).trim();
    if (prop === "text-align" && /^(left|right|center|justify)$/i.test(val)) out.push(`text-align: ${val}`);
    else if ((prop === "width" || prop === "min-width") && LENGTH.test(val)) out.push(`${prop}: ${val}`);
    else if (prop === "background-color" && COLOR.test(val)) out.push(`background-color: ${val}`);
  }
  return out.join("; ");
}

function cleanAttr(tag: string, name: string, raw: string): string | null {
  switch (name) {
    case "href": {
      const u = safeUrl(raw, true);
      return u && escapeAttr(u);
    }
    case "src": {
      const u = safeUrl(raw, false);
      return u && escapeAttr(u);
    }
    case "target":
      return raw === "_blank" ? "_blank" : null;
    case "rel": {
      const ok = raw.split(/\s+/).filter((t) => /^(noopener|noreferrer|nofollow|sponsored|ugc)$/i.test(t));
      return ok.length ? ok.join(" ") : null;
    }
    case "style": {
      const s = safeStyle(raw);
      return s ? escapeAttr(s) : null;
    }
    case "class":
      return tag === "figure" && raw === "blog-figure" ? raw : null;
    case "colspan":
    case "rowspan":
    case "span":
    case "start":
    case "width":
    case "height":
      return /^\d{1,5}$/.test(raw.trim()) ? raw.trim() : null;
    case "colwidth":
      return /^[\d,]+$/.test(raw.trim()) ? raw.trim() : null;
    case "data-align":
      return /^(left|center|right)$/.test(raw) ? raw : null;
    case "data-width":
      return LENGTH.test(raw) ? raw : null;
    case "data-bg":
      return COLOR.test(raw) ? raw : null;
    case "alt":
    case "title":
    case "data-caption":
      return escapeAttr(raw);
    default:
      return null;
  }
}

export function sanitizeHtml(input: string): string {
  const out: string[] = [];
  const stack: string[] = [];
  let skipUntil: string | null = null;

  for (const token of input.match(TOKEN) ?? []) {
    if (token === "<") {
      if (!skipUntil) out.push("&lt;");
      continue;
    }
    if (!token.startsWith("<")) {
      if (!skipUntil) out.push(token);
      continue;
    }
    if (token.startsWith("<!--")) continue;

    const closing = token.startsWith("</");
    const nameMatch = token.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!nameMatch) continue;
    let tag = nameMatch[1].toLowerCase();

    if (skipUntil) {
      if (closing && tag === skipUntil) skipUntil = null;
      continue;
    }
    if (DROP_WITH_CONTENT.has(tag)) {
      if (!closing && !token.endsWith("/>")) skipUntil = tag;
      continue;
    }
    if (!(tag in TAGS)) continue; // unknown tag: drop the tag, keep its text

    // Articles already have a page-level H1, so body H1s become H2s
    if (tag === "h1") tag = "h2";

    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at < 0) continue;
      while (stack.length > at) out.push(`</${stack.pop()}>`);
      continue;
    }

    const attrs: string[] = [];
    const attrSource = token.slice(nameMatch[0].length, token.endsWith("/>") ? -2 : -1);
    const seen = new Set<string>();
    for (const m of attrSource.matchAll(ATTR)) {
      const name = m[1].toLowerCase();
      if (seen.has(name) || !TAGS[tag].includes(name)) continue;
      const cleaned = cleanAttr(tag, name, m[2] ?? m[3] ?? m[4] ?? "");
      if (cleaned === null) continue;
      seen.add(name);
      attrs.push(`${name}="${cleaned}"`);
    }

    if (tag === "a" && seen.has("target")) {
      const rel = attrs.findIndex((a) => a.startsWith("rel="));
      const base = "noopener noreferrer";
      if (rel >= 0) {
        const existing = attrs[rel].slice(5, -1).split(" ");
        attrs[rel] = `rel="${[...new Set([...existing, ...base.split(" ")])].join(" ")}"`;
      } else attrs.push(`rel="${base}"`);
    }
    if (tag === "img") {
      if (!seen.has("src")) continue;
      attrs.push('loading="lazy"', 'decoding="async"');
    }

    out.push(`<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>`);
    if (!VOID.has(tag)) stack.push(tag);
  }

  while (stack.length) out.push(`</${stack.pop()}>`);
  return out.join("");
}

/* ───────── Article preparation ───────── */

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const stripTags = (h: string) => h.replace(/<[^>]*>/g, "");
const decodeBasic = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";

/** Sanitizes the body, gives H2/H3 stable ids and returns the table of contents. */
export function prepareArticle(rawHtml: string): { html: string; toc: TocItem[]; wordCount: number } {
  const clean = sanitizeHtml(rawHtml || "");
  const toc: TocItem[] = [];
  const used = new Map<string, number>();

  const html = clean.replace(/<h([2-6])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g, (full, lvl, attrs, inner) => {
    const level = Number(lvl);
    if (level > 3) return full;
    const text = decodeBasic(stripTags(inner)).trim();
    if (!text) return full;
    const base = slugify(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    toc.push({ id, text, level: level as 2 | 3 });
    return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
  });

  const words = decodeBasic(stripTags(clean)).trim().split(/\s+/).filter(Boolean).length;
  return { html, toc, wordCount: words };
}
