"use client";

import { useState } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const toolbarButton =
  "focus-ring rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d332b] data-[active=true]:border-[#1c6d62] data-[active=true]:bg-[#e9f4f1] data-[active=true]:text-[#1c6d62]";

export function RichTextEditor({
  defaultValue = "",
  name,
}: {
  defaultValue?: string;
  name: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "focus-ring min-h-[260px] rounded-b-md border border-t-0 border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed outline-none prose-lite",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: false,
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => setHtml(activeEditor.getHTML()),
  });

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function addImage() {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-2 rounded-t-md border border-[var(--border)] bg-[#f7f0e8] p-2">
        <button type="button" className={toolbarButton} data-active={editor?.isActive("heading", { level: 2 }) || false} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("heading", { level: 3 }) || false} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("bold") || false} onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("italic") || false} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("bulletList") || false} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("orderedList") || false} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("blockquote") || false} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>
        <button type="button" className={toolbarButton} data-active={editor?.isActive("link") || false} onClick={setLink}>
          Link
        </button>
        <button type="button" className={toolbarButton} onClick={addImage}>
          Image
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
