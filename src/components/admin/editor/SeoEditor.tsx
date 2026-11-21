"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

const cellBackground = {
  backgroundColor: {
    default: null,
    parseHTML: (el: HTMLElement) => el.getAttribute("data-bg") || el.style.backgroundColor || null,
    renderHTML: (attrs: Record<string, unknown>) =>
      attrs.backgroundColor
        ? { "data-bg": attrs.backgroundColor as string, style: `background-color: ${attrs.backgroundColor}` }
        : {},
  },
};
const ColoredCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackground };
  },
});
const ColoredHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackground };
  },
});

function removeEmptySelectedCells(editor: Editor): boolean {
  const sel = editor.state.selection;
  if (!(sel instanceof CellSelection)) return false;

  let allEmpty = true;
  sel.forEachCell((cell) => {
    if (cell.textContent !== "") allEmpty = false;
  });
  if (!allEmpty) return false; // let the default handler clear the cell contents first

  const chain = editor.chain().focus();
  if (sel.isRowSelection() && editor.can().deleteRow()) return chain.deleteRow().run();
  if (sel.isColSelection() && editor.can().deleteColumn()) return chain.deleteColumn().run();
  // selection covers every row/column (e.g. a one-row table): remove the table itself
  if (sel.isRowSelection() || sel.isColSelection()) return chain.deleteTable().run();
  return false;
}

/**
 * Enter inside a table cell adds a new row below and moves the cursor into the
 * same column of that row. Shift+Enter still inserts a line break inside the cell,
 * and Enter inside a list within a cell keeps its normal list behaviour.
 */
const TableEnterNewRow = Extension.create({
  name: "tableEnterNewRow",
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!editor.isActive("table") || editor.isActive("listItem")) return false;

        const { $from } = editor.state.selection;
        let rowDepth = -1;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === "tableRow") {
            rowDepth = d;
            break;
          }
        }
        if (rowDepth < 1) return false;

        const tableDepth = rowDepth - 1;
        const col = $from.index(rowDepth);
        const row = $from.index(tableDepth);
        const tablePos = $from.before(tableDepth);

        if (!editor.chain().addRowAfter().run()) return false;

        // Move the cursor into the new row, same column
        const { doc, tr } = editor.state;
        const table = doc.nodeAt(tablePos);
        if (!table || row + 1 >= table.childCount) return true;

        let rowPos = tablePos + 1;
        for (let i = 0; i <= row; i++) rowPos += table.child(i).nodeSize;
        const newRow = table.child(row + 1);

        let cellPos = rowPos + 1;
        for (let j = 0; j < Math.min(col, newRow.childCount - 1); j++) cellPos += newRow.child(j).nodeSize;

        editor.view.dispatch(tr.setSelection(TextSelection.near(doc.resolve(cellPos + 1))).scrollIntoView());
        return true;
      },
      // Delete / Backspace with whole rows, columns or the whole table selected:
      // first press clears the text (default); once the selection is empty, the next press removes it.
      Delete: ({ editor }) => removeEmptySelectedCells(editor),
      // Backspace in a completely empty row deletes that row (mirror of Enter adding one)
      Backspace: ({ editor }) => {
        if (removeEmptySelectedCells(editor)) return true;
        const { selection } = editor.state;
        if (!selection.empty || !editor.isActive("table") || editor.isActive("listItem")) return false;

        const { $from } = selection;
        if ($from.parentOffset !== 0) return false;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === "tableRow") {
            if ($from.node(d).textContent !== "") return false;
            return editor.can().deleteRow() ? editor.chain().deleteRow().run() : false;
          }
        }
        return false;
      },
    };
  },
});

/** Fixed editor body height; the content scrolls inside it while the toolbar stays put */
const BODY_HEIGHT = "h-[70vh] min-h-[420px] max-h-[820px]";

const CELL_COLORS = [
  { label: "None", value: "" },
  { label: "Gray", value: "#f1f1ee" },
  { label: "Blue", value: "#dbeafe" },
  { label: "Green", value: "#dcfce7" },
  { label: "Yellow", value: "#fef9c3" },
  { label: "Red", value: "#fee2e2" },
  { label: "Purple", value: "#ede9fe" },
];
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Eye,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  ImagePlus,
  UploadCloud,
  Globe,
  Table as TableIcon,
  Undo2,
  Redo2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2,
  Minus,
  ChevronDown,
  RemoveFormatting,
  X,
} from "lucide-react";
import { SeoImage } from "./SeoImageExtension";
import { uploadImage, validateImage } from "@/src/lib/uploadImage";

interface SeoEditorProps {
  value: string;
  onChange: (html: string) => void;
}

type ImageSourceTab = "upload" | "url";

interface ImageModalState {
  open: boolean;
  isNew: boolean;
  tab: ImageSourceTab;
  src: string;
  alt: string;
  title: string;
  caption: string;
  align: "left" | "center" | "right";
  width: string;
}

interface LinkModalState {
  open: boolean;
  text: string;
  href: string;
  nofollow: boolean;
  sponsored: boolean;
  newTab: boolean;
}

/**
 * Strips Word / Google Docs / webpage inline styling & wrapper spans
 * while keeping semantic HTML tags (h1-h6, p, strong, em, ul, ol, li, a, table, blockquote).
 */
function cleanPastedHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("style, script, meta, link, xml, o\\:p").forEach((el) => el.remove());

  doc.querySelectorAll("span, font").forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });

  doc.body.querySelectorAll("*").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const allowedAttrs =
      tag === "a"
        ? ["href", "target", "rel"]
        : tag === "img"
          ? ["src", "alt", "title"]
          : tag === "td" || tag === "th"
            ? ["colspan", "rowspan"]
            : [];

    Array.from(el.attributes).forEach((attr) => {
      if (!allowedAttrs.includes(attr.name.toLowerCase())) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

/**
 * Lightweight HTML formatter so Code View is readable when toggled on.
 */
function formatHtml(html: string): string {
  return html
    .replace(/></g, ">\n<")
    .replace(
      /(<(h[1-6]|p|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|img|pre)[^>]*>)/gi,
      "\n$1"
    )
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export default function SeoEditor({ value, onChange }: SeoEditorProps) {
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // View mode: "visual" (Tiptap WYSIWYG) vs "code" (Raw HTML)
  const [tablePicker, setTablePicker] = useState({ open: false, rows: 1, cols: 1, header: true });
  const [tablePos, setTablePos] = useState({ top: 0, left: 0 });
  const tableBtnRef = useRef<HTMLButtonElement>(null);
  const tablePickerOpen = tablePicker.open;

  // The picker is positioned from the button's rect, so close it if the page moves underneath it
  useEffect(() => {
    if (!tablePickerOpen) return;
    const close = () => setTablePicker((t) => ({ ...t, open: false }));
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [tablePickerOpen]);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [rawHtml, setRawHtml] = useState(value);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [modalUploadError, setModalUploadError] = useState("");

  // Unified Image Modal (Upload or URL + Alt, Title, Caption, Size, Alignment)
  const [imgModal, setImgModal] = useState<ImageModalState>({
    open: false,
    isNew: true,
    tab: "upload",
    src: "",
    alt: "",
    title: "",
    caption: "",
    align: "center",
    width: "100%",
  });

  // Anchor / Link Modal
  const [linkModal, setLinkModal] = useState<LinkModalState>({
    open: false,
    text: "",
    href: "",
    nofollow: false,
    sponsored: false,
    newTab: true,
  });

  const handleImageUploadToModal = useCallback(async (file: File, openModal = true) => {
    const invalid = validateImage(file);
    if (invalid) {
      const msg = invalid;
      setModalUploadError(msg);
      if (!openModal) setUploadError(msg);
      return;
    }

    setUploading(true);
    setModalUploadError("");
    setUploadError("");

    try {
      const url = await uploadImage(file);
      const suggestedAlt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

      setImgModal((prev) => ({
        open: true,
        isNew: openModal ? true : prev.isNew,
        tab: "upload",
        src: url,
        alt: prev.alt || suggestedAlt,
        title: prev.title || "",
        caption: prev.caption || "",
        align: prev.align || "center",
        width: prev.width || "100%",
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setModalUploadError(msg);
      if (!openModal) setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline underline-offset-2",
        },
      }),
      SeoImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      ColoredHeader,
      ColoredCell,
      TableEnterNewRow,
      CharacterCount,
      Placeholder.configure({
        placeholder:
          "Start writing your SEO article… Use H2/H3 subheadings and descriptive image alt text.",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "rich-content min-h-full px-6 py-5 focus:outline-none",
      },
      transformPastedHTML(html) {
        return cleanPastedHtml(html);
      },
      handleDrop(_view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file && file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUploadToModal(file, true);
            return true;
          }
        }
        return false;
      },
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              handleImageUploadToModal(file, true);
              return true;
            }
          }
        }
        return false;
      },
      handleClickOn(_view, _pos, node) {
        if (node.type.name === "image") {
          setModalUploadError("");
          setImgModal({
            open: true,
            isNew: false,
            tab: "url",
            src: node.attrs.src || "",
            alt: node.attrs.alt || "",
            title: node.attrs.title || "",
            caption: node.attrs.caption || "",
            align: node.attrs.align || "center",
            width: node.attrs.width || "100%",
          });
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: ed }) {
      const html = ed.getHTML();
      onChange(html);
    },
  });

  // Sync external value updates (e.g., when async post data finishes loading)
  useEffect(() => {
    if (!editor || viewMode === "code") return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor, viewMode]);

  if (!editor) return null;

  function switchViewMode(nextMode: "visual" | "code") {
    if (nextMode === viewMode) return;
    if (nextMode === "code") {
      setRawHtml(formatHtml(editor!.getHTML()));
      setViewMode("code");
    } else {
      editor!.commands.setContent(rawHtml, { emitUpdate: true });
      onChange(editor!.getHTML());
      setViewMode("visual");
    }
  }

  function handleCodeChange(nextCode: string) {
    setRawHtml(nextCode);
    onChange(nextCode);
  }

  // Live SEO stats
  const words = editor.storage.characterCount.words();
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  const headings: { level: number; text: string }[] = [];
  let missingAltCount = 0;
  let totalImages = 0;

  editor.state.doc.descendants((node) => {
    if (node.type.name === "heading") {
      headings.push({ level: node.attrs.level, text: node.textContent });
    }
    if (node.type.name === "image") {
      totalImages += 1;
      if (!node.attrs.alt?.trim()) missingAltCount += 1;
    }
  });

  const activeHeading =
    ([1, 2, 3, 4, 5, 6] as const).find((lvl) =>
      editor.isActive("heading", { level: lvl })
    ) || 0;

  function openNewImageDialog() {
    setModalUploadError("");
    setImgModal({
      open: true,
      isNew: true,
      tab: "upload",
      src: "",
      alt: "",
      title: "",
      caption: "",
      align: "center",
      width: "100%",
    });
  }

  function openLinkDialog() {
    // Expand selection to full link range if cursor is inside an existing link
    if (editor!.isActive("link")) {
      editor!.chain().focus().extendMarkRange("link").run();
    }
    const { from, to } = editor!.state.selection;
    const selectedText = editor!.state.doc.textBetween(from, to, " ");
    const prev = editor!.getAttributes("link");
    const rel = prev.rel || "";

    setLinkModal({
      open: true,
      text: selectedText,
      href: prev.href || "",
      nofollow: rel.includes("nofollow"),
      sponsored: rel.includes("sponsored"),
      newTab: prev.target ? prev.target === "_blank" : true,
    });
  }

  function applyLink() {
    const href = linkModal.href.trim();
    if (!href) {
      editor!.chain().focus().unsetLink().run();
      setLinkModal((s) => ({ ...s, open: false }));
      return;
    }

    const relParts = ["noopener", "noreferrer"];
    if (linkModal.nofollow) relParts.push("nofollow");
    if (linkModal.sponsored) relParts.push("sponsored");

    const linkAttrs = {
      href,
      target: linkModal.newTab ? "_blank" : null,
      rel: relParts.join(" "),
    };

    const { from, to } = editor!.state.selection;
    const currentSelectedText = editor!.state.doc.textBetween(from, to, " ");
    const desiredText = linkModal.text.trim() || href;

    if (desiredText !== currentSelectedText) {
      editor!
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: desiredText,
          marks: [{ type: "link", attrs: linkAttrs }],
        })
        .run();
    } else {
      editor!.chain().focus().setLink(linkAttrs).run();
    }

    setLinkModal((s) => ({ ...s, open: false }));
  }

  function removeLink() {
    editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkModal((s) => ({ ...s, open: false }));
  }

  function saveImageAttributes() {
    if (!imgModal.src.trim()) {
      setModalUploadError("Upload an image or paste a valid image URL first.");
      return;
    }

    const attrs = {
      src: imgModal.src.trim(),
      alt: imgModal.alt.trim(),
      title: imgModal.title.trim() || "",
      caption: imgModal.caption.trim(),
      align: imgModal.align,
      width: imgModal.width || "100%",
    };

    if (imgModal.isNew) {
      editor!.chain().focus().insertContent({ type: "image", attrs }).run();
    } else {
      editor!.chain().focus().updateAttributes("image", attrs).run();
    }
    setImgModal((s) => ({ ...s, open: false }));
  }

  function removeSelectedImage() {
    editor!.chain().focus().deleteSelection().run();
    setImgModal((s) => ({ ...s, open: false }));
  }

  const isCodeMode = viewMode === "code";

  const tableActions = [
    { label: "Row above", run: () => editor.chain().focus().addRowBefore().run(), can: editor.can().addRowBefore() },
    { label: "Row below", run: () => editor.chain().focus().addRowAfter().run(), can: editor.can().addRowAfter() },
    // ProseMirror refuses to delete a table's only row/column, so fall back to removing the table
    {
      label: "Delete row",
      run: () =>
        editor.can().deleteRow()
          ? editor.chain().focus().deleteRow().run()
          : editor.chain().focus().deleteTable().run(),
      can: true,
    },
    { label: "Col left", run: () => editor.chain().focus().addColumnBefore().run(), can: editor.can().addColumnBefore() },
    { label: "Col right", run: () => editor.chain().focus().addColumnAfter().run(), can: editor.can().addColumnAfter() },
    {
      label: "Delete col",
      run: () =>
        editor.can().deleteColumn()
          ? editor.chain().focus().deleteColumn().run()
          : editor.chain().focus().deleteTable().run(),
      can: true,
    },
    { label: "Header row", run: () => editor.chain().focus().toggleHeaderRow().run(), can: editor.can().toggleHeaderRow() },
    { label: "Header col", run: () => editor.chain().focus().toggleHeaderColumn().run(), can: editor.can().toggleHeaderColumn() },
    { label: "Merge", run: () => editor.chain().focus().mergeCells().run(), can: editor.can().mergeCells() },
    { label: "Split", run: () => editor.chain().focus().splitCell().run(), can: editor.can().splitCell() },
  ];

  const toolBtn = (active: boolean) =>
    `rounded-lg p-1.5 transition disabled:opacity-35 disabled:pointer-events-none ${active ? "bg-ink text-white" : "text-ink-soft hover:bg-canvas hover:text-ink"
    }`;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-white"
      onKeyDown={(e) => {
        if (!isCodeMode && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          openLinkDialog();
        }
      }}
    >
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-line bg-white/95 px-3 py-2 backdrop-blur">
        {/* Heading Level Dropdown */}
        <select
          aria-label="Text style"
          disabled={isCodeMode}
          value={activeHeading}
          onChange={(e) => {
            const lvl = Number(e.target.value);
            if (lvl === 0) editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: lvl as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
          }}
          className="mr-1 rounded-lg border border-line bg-canvas/60 px-2.5 py-1.5 text-xs font-medium text-ink outline-none disabled:opacity-40"
        >
          <option value={0}>Paragraph</option>
          <option value={1}>Heading 1 (H1)</option>
          <option value={2}>Heading 2 (H2)</option>
          <option value={3}>Heading 3 (H3)</option>
          <option value={4}>Heading 4 (H4)</option>
          <option value={5}>Heading 5 (H5)</option>
          <option value={6}>Heading 6 (H6)</option>
        </select>

        <div className="mx-1 h-5 w-px bg-line" />

        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleBold().run()} className={toolBtn(editor.isActive("bold"))} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleItalic().run()} className={toolBtn(editor.isActive("italic"))} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolBtn(editor.isActive("underline"))} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleStrike().run()} className={toolBtn(editor.isActive("strike"))} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleCode().run()} className={toolBtn(editor.isActive("code"))} title="Inline code">
          <Code className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolBtn(editor.isActive("bulletList"))} title="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolBtn(editor.isActive("orderedList"))} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toolBtn(editor.isActive("blockquote"))} title="Blockquote">
          <Quote className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().setTextAlign("left").run()} className={toolBtn(editor.isActive({ textAlign: "left" }))} title="Align left">
          <AlignLeft className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().setTextAlign("center").run()} className={toolBtn(editor.isActive({ textAlign: "center" }))} title="Align center">
          <AlignCenter className="h-4 w-4" />
        </button>
        <button type="button" disabled={isCodeMode} onClick={() => editor.chain().focus().setTextAlign("right").run()} className={toolBtn(editor.isActive({ textAlign: "right" }))} title="Align right">
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        <button type="button" disabled={isCodeMode} onClick={openLinkDialog} className={toolBtn(editor.isActive("link"))} title="Insert / edit link (Ctrl+K)">
          <Link2 className="h-4 w-4" />
        </button>
        {editor.isActive("link") && !isCodeMode && (
          <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={toolBtn(false)} title="Remove link">
            <Unlink className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          disabled={isCodeMode}
          onClick={openNewImageDialog}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-canvas disabled:pointer-events-none disabled:opacity-35"
          title="Insert image (Upload or URL)"
        >
          <ImagePlus className="h-4 w-4" />
          <span>Image</span>
        </button>

        <div className="relative">
          <button
            type="button"
            disabled={isCodeMode}
            ref={tableBtnRef}
            onClick={() => {
              const r = tableBtnRef.current?.getBoundingClientRect();
              if (r) {
                // keep the picker fully on-screen (it's up to ~380px wide)
                setTablePos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 390)) });
              }
              setTablePicker((t) => ({ ...t, open: !t.open }));
            }}
            className={`flex items-center gap-0.5 ${toolBtn(editor.isActive("table") || tablePicker.open)}`}
            title="Insert table"
          >
            <TableIcon className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
          {tablePicker.open && !isCodeMode && createPortal(
            <>
              {/* click-away layer */}
              <div className="fixed inset-0 z-[60]" onClick={() => setTablePicker((t) => ({ ...t, open: false }))} />
              {/* Rendered in a portal with fixed positioning so the editor's overflow-hidden can't clip it */}
              <div
                className="fixed z-[61] w-max rounded-xl border border-line bg-white p-3 shadow-lg"
                style={{ top: tablePos.top, left: tablePos.left }}
              >
                {/* Grid grows as you hover toward its edge, like Google Docs */}
                <div
                  className="grid gap-[3px]"
                  style={{ gridTemplateColumns: `repeat(${Math.min(15, Math.max(10, tablePicker.cols + 1))}, 1.25rem)` }}
                  onMouseLeave={() => setTablePicker((t) => ({ ...t, rows: 1, cols: 1 }))}
                >
                  {Array.from({ length: Math.min(12, Math.max(6, tablePicker.rows + 1)) }).flatMap((_, r) =>
                    Array.from({ length: Math.min(15, Math.max(10, tablePicker.cols + 1)) }).map((__, c) => {
                      const active = r < tablePicker.rows && c < tablePicker.cols;
                      return (
                        <button
                          key={`${r}-${c}`}
                          type="button"
                          aria-label={`${r + 1} by ${c + 1} table`}
                          onMouseEnter={() => setTablePicker((t) => ({ ...t, rows: r + 1, cols: c + 1 }))}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            editor
                              .chain()
                              .focus()
                              .insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: tablePicker.header })
                              .run();
                            setTablePicker((t) => ({ ...t, open: false, rows: 1, cols: 1 }));
                          }}
                          className={`h-5 w-5 rounded-[3px] border transition-colors ${
                            active ? "border-brand-400 bg-brand-100" : "border-line bg-white"
                          }`}
                        />
                      );
                    })
                  )}
                </div>
                <div className="mt-2 text-center text-xs font-medium text-ink-soft">
                  {tablePicker.cols} × {tablePicker.rows}
                </div>
                <label className="mt-2 flex items-center justify-center gap-2 border-t border-line pt-2 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={tablePicker.header}
                    onChange={(e) => setTablePicker((t) => ({ ...t, header: e.target.checked }))}
                  />
                  Header row
                </label>
              </div>
            </>,
            document.body
          )}
        </div>

        <button
          type="button"
          disabled={isCodeMode}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={toolBtn(false)}
          title="Horizontal rule"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={isCodeMode}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={toolBtn(false)}
          title="Clear formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>

        {/* Right Controls: Undo/Redo + Visual/HTML Mode Switcher */}
        <div className="ml-auto flex items-center gap-2">
          {!isCodeMode && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-canvas disabled:opacity-30"
                title="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-canvas disabled:opacity-30"
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Segmented View Switcher: Visual vs HTML Code */}
          <div
            role="group"
            aria-label="Editor view mode"
            className="flex items-center rounded-lg border border-line bg-canvas/70 p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => switchViewMode("visual")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${viewMode === "visual"
                  ? "bg-white text-ink shadow-xs"
                  : "text-ink-soft hover:text-ink"
                }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Visual
            </button>
            <button
              type="button"
              onClick={() => switchViewMode("code")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${viewMode === "code"
                  ? "bg-white text-ink shadow-xs"
                  : "text-ink-soft hover:text-ink"
                }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              HTML
            </button>
          </div>
        </div>
      </div>

      {/* Link bar: clicking a link in the editor shows its URL with Edit / Open / Remove */}
      {!isCodeMode && editor.isActive("link") && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-canvas/60 px-3 py-1.5 text-xs">
          <Link2 className="h-3.5 w-3.5 text-ink-soft" />
          <span className="max-w-xs truncate text-ink-soft" title={editor.getAttributes("link").href}>
            {editor.getAttributes("link").href}
          </span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={openLinkDialog}
            className="rounded-md border border-line bg-white px-2 py-1 font-medium text-ink hover:bg-canvas"
          >
            Edit link
          </button>
          <a
            href={editor.getAttributes("link").href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-line bg-white px-2 py-1 font-medium text-ink-soft hover:text-ink"
          >
            Open in new tab
          </a>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={removeLink}
            className="rounded-md border border-rose-200 bg-white px-2 py-1 font-medium text-rose-700 hover:bg-rose-50"
          >
            Remove link
          </button>
        </div>
      )}

      {/* Contextual table controls (visible while the cursor is inside a table) */}
      {!isCodeMode && editor.isActive("table") && (
        <div className="flex flex-wrap items-center gap-1 border-b border-line bg-canvas/60 px-3 py-1.5 text-xs">
          <span className="mr-1 font-semibold text-ink">Table</span>
          {tableActions.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={!a.can}
              onMouseDown={(e) => e.preventDefault()}
              onClick={a.run}
              className="rounded-md border border-line bg-white px-2 py-1 font-medium text-ink-soft transition hover:text-ink disabled:pointer-events-none disabled:opacity-35"
            >
              {a.label}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-line" />
          <span className="text-ink-faint">Cell color</span>
          {CELL_COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor.chain().focus().setCellAttribute("backgroundColor", c.value || null).run()
              }
              className="h-5 w-5 rounded-full border border-line"
              style={{ backgroundColor: c.value || "#fff" }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="ml-auto flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 font-medium text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete table
          </button>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center justify-between bg-rose-50 px-4 py-2 text-xs text-rose-800">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError("")}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Contextual Tip Bar */}
      {viewMode === "code" ? (
        <div className="flex items-center justify-between border-b border-line bg-amber-50/70 px-4 py-1.5 text-xs text-amber-900">
          <span>
            Editing raw HTML directly. Switch back to <strong>Visual</strong> to preview and use formatting tools.
          </span>
        </div>
      ) : (
        totalImages > 0 && (
          <div className="flex items-center justify-between border-b border-line bg-canvas/50 px-4 py-1.5 text-xs text-ink-soft">
            <span>
              Click any image in the editor to edit its Alt tag, Size, Title, Caption, or Alignment.
            </span>
            {missingAltCount > 0 ? (
              <span className="flex items-center gap-1 font-medium text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {missingAltCount} image{missingAltCount > 1 ? "s" : ""} missing alt text
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All {totalImages} images have alt text
              </span>
            )}
          </div>
        )
      )}

      {/* Main Writing Canvas: Visual vs HTML Code */}
      {viewMode === "visual" ? (
        <div className={`${BODY_HEIGHT} overflow-y-auto overscroll-contain`}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      ) : (
        <textarea
          aria-label="Raw HTML content"
          value={rawHtml}
          onChange={(e) => handleCodeChange(e.target.value)}
          spellCheck={false}
          className={`${BODY_HEIGHT} block w-full resize-none overflow-y-auto bg-neutral-950 p-5 font-mono text-[13px] leading-relaxed text-emerald-300 focus:outline-none`}
        />
      )}

      {/* Bottom SEO & Word Count Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/40 px-4 py-2.5 text-xs text-ink-soft">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-ink">{words}</strong> words
          </span>
          <span>~{readMinutes} min read</span>
          <span>
            <strong className="text-ink">{headings.length}</strong> headings
          </span>
        </div>
        {headings.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {headings.slice(0, 8).map((h, i) => (
              <span
                key={i}
                className="rounded border border-line bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink-soft"
              >
                H{h.level}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          UNIFIED IMAGE MODAL (Upload OR URL + Alt + Size + Title + Caption)
      ===================================================================== */}
      {imgModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">
                {imgModal.isNew ? "Insert Image" : "Edit Image & SEO Settings"}
              </h3>
              <button
                type="button"
                onClick={() => setImgModal((s) => ({ ...s, open: false }))}
                className="text-ink-soft hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Source Tabs: Upload File vs Paste URL */}
            <div className="mb-4 grid grid-cols-2 rounded-xl border border-line bg-canvas/60 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setImgModal((s) => ({ ...s, tab: "upload" }))}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${imgModal.tab === "upload"
                    ? "bg-white text-ink shadow-xs"
                    : "text-ink-soft hover:text-ink"
                  }`}
              >
                <UploadCloud className="h-4 w-4" />
                Upload File (Cloudinary)
              </button>
              <button
                type="button"
                onClick={() => setImgModal((s) => ({ ...s, tab: "url" }))}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${imgModal.tab === "url"
                    ? "bg-white text-ink shadow-xs"
                    : "text-ink-soft hover:text-ink"
                  }`}
              >
                <Globe className="h-4 w-4" />
                Image URL
              </button>
            </div>

            {/* Source Input Area */}
            {imgModal.tab === "upload" ? (
              <div className="mb-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageUploadToModal(file, false);
                  }}
                  onClick={() => modalFileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-canvas/30 px-4 py-6 text-center transition hover:border-ink/40 hover:bg-canvas/60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-ink" />
                      <span className="text-xs font-medium text-ink">
                        Uploading to Cloudinary…
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-6 w-6 text-ink-soft" />
                      <div className="text-xs font-medium text-ink">
                        Click to choose an image or drag & drop here
                      </div>
                      <div className="text-[11px] text-ink-faint">
                        PNG, JPG, WebP, GIF or AVIF · max 10 MB
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUploadToModal(f, false);
                    e.target.value = "";
                  }}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-ink">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imgModal.src}
                  onChange={(e) => setImgModal((s) => ({ ...s, src: e.target.value }))}
                  placeholder="https://res.cloudinary.com/... or https://example.com/photo.jpg"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            )}

            {modalUploadError && (
              <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {modalUploadError}
              </p>
            )}

            {/* Live Image Preview */}
            {imgModal.src.trim() && (
              <div className="mb-4 overflow-hidden rounded-xl border border-line bg-canvas/50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgModal.src}
                  alt={imgModal.alt || "Preview"}
                  style={{ width: imgModal.width === "auto" ? "auto" : imgModal.width }}
                  className="mx-auto max-h-48 rounded-lg object-contain transition-all"
                />
              </div>
            )}

            {/* SEO & Sizing Attributes */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-ink">
                  <span>Alt Text (Required for SEO & Screen Readers)</span>
                  {!imgModal.alt.trim() && (
                    <span className="text-amber-600">Missing alt tag</span>
                  )}
                </label>
                <input
                  value={imgModal.alt}
                  onChange={(e) => setImgModal((s) => ({ ...s, alt: e.target.value }))}
                  placeholder="Describe the image accurately with relevant context…"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">
                    Display Size
                  </label>
                  <select
                    value={imgModal.width}
                    onChange={(e) => setImgModal((s) => ({ ...s, width: e.target.value }))}
                    className="w-full rounded-lg border border-line px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="100%">Full Width (100%)</option>
                    <option value="75%">Large (75%)</option>
                    <option value="50%">Medium (50%)</option>
                    <option value="25%">Small (25%)</option>
                    <option value="auto">Original (Auto)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">
                    Alignment
                  </label>
                  <select
                    value={imgModal.align}
                    onChange={(e) =>
                      setImgModal((s) => ({
                        ...s,
                        align: e.target.value as "left" | "center" | "right",
                      }))
                    }
                    className="w-full rounded-lg border border-line px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">
                    Title Attribute
                  </label>
                  <input
                    value={imgModal.title}
                    onChange={(e) => setImgModal((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Hover tooltip"
                    className="w-full rounded-lg border border-line px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Caption (Optional)
                </label>
                <input
                  value={imgModal.caption}
                  onChange={(e) => setImgModal((s) => ({ ...s, caption: e.target.value }))}
                  placeholder="Optional caption text saved in data-caption"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              {!imgModal.isNew ? (
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove image
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImgModal((s) => ({ ...s, open: false }))}
                  className="rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploading || !imgModal.src.trim()}
                  onClick={saveImageAttributes}
                  className="rounded-lg bg-ink px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
                >
                  {imgModal.isNew ? "Insert Image" : "Update Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ANCHOR / LINK MODAL (Text + URL + Target + SEO Rel Attributes)
      ===================================================================== */}
      {linkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Insert / Edit Anchor Link</h3>
              <button
                type="button"
                onClick={() => setLinkModal((s) => ({ ...s, open: false }))}
                className="text-ink-soft hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Anchor Text
                </label>
                <input
                  value={linkModal.text}
                  onChange={(e) => setLinkModal((s) => ({ ...s, text: e.target.value }))}
                  placeholder="Descriptive link text (avoid 'click here')"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={linkModal.href}
                  onChange={(e) => setLinkModal((s) => ({ ...s, href: e.target.value }))}
                  placeholder="https://example.com/resource or /blogs/related-post"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>

              <div className="space-y-2 rounded-xl border border-line bg-canvas/40 p-3">
                <label className="flex items-center gap-2 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={linkModal.newTab}
                    onChange={(e) =>
                      setLinkModal((s) => ({ ...s, newTab: e.target.checked }))
                    }
                  />
                  Open in new tab (<code>target=&quot;_blank&quot;</code>)
                </label>
                <label className="flex items-center gap-2 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={linkModal.nofollow}
                    onChange={(e) =>
                      setLinkModal((s) => ({ ...s, nofollow: e.target.checked }))
                    }
                  />
                  Add <code>rel=&quot;nofollow&quot;</code> (external / untrusted links)
                </label>
                <label className="flex items-center gap-2 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={linkModal.sponsored}
                    onChange={(e) =>
                      setLinkModal((s) => ({ ...s, sponsored: e.target.checked }))
                    }
                  />
                  Add <code>rel=&quot;sponsored&quot;</code> (affiliate / paid links)
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              {editor.isActive("link") ? (
                <button
                  type="button"
                  onClick={removeLink}
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:underline"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Remove link
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModal((s) => ({ ...s, open: false }))}
                  className="rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="rounded-lg bg-ink px-4 py-2 text-xs font-medium text-white hover:opacity-90"
                >
                  Apply Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}