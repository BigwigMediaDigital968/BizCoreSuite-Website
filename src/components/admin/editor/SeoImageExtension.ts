import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/react";

export const SeoImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: "",
        parseHTML: (el) => el.getAttribute("alt") || "",
        renderHTML: (attrs) => ({ alt: attrs.alt || "" }),
      },
      title: {
        default: null,
        parseHTML: (el) => el.getAttribute("title"),
        renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
      },
      caption: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-caption") || "",
        renderHTML: (attrs) =>
          attrs.caption ? { "data-caption": attrs.caption } : {},
      },
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align || "center" }),
      },
      width: {
        default: "100%",
        parseHTML: (el) =>
          el.getAttribute("data-width") || el.style.width || "100%",
        renderHTML: (attrs) => {
          const w = attrs.width || "100%";
          return {
            "data-width": w,
            style: w === "auto" ? "width: auto;" : `width: ${w};`,
          };
        },
      },
      loading: {
        default: "lazy",
        renderHTML: () => ({ loading: "lazy" }),
      },
    };
  },
  // Wrap in <figure>/<figcaption> when a caption is set (semantic, SEO-friendly)
  renderHTML({ HTMLAttributes, node }) {
    const img = ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)] as const;
    const caption = String(node.attrs.caption || "").trim();
    if (!caption) return img;
    return [
      "figure",
      { class: "blog-figure", "data-align": node.attrs.align || "center" },
      img,
      ["figcaption", {}, caption],
    ];
  },
});
