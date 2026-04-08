"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { TextStyleKit } from "@tiptap/extension-text-style"
import { Highlight } from "@tiptap/extension-highlight"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Palette, Highlighter, List, ListOrdered, Undo, Redo, Unlink, Quote, Minus } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minimal?: boolean
}

const MenuButton = ({
  onClick,
  isActive,
  children,
  title,
  disabled,
}: {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title: string
  disabled?: boolean
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-7 w-7 p-0",
      isActive && "bg-muted text-foreground"
    )}
    title={title}
  >
    {children}
  </Button>
)

const PRESETS = [
  "#000000", "#374151", "#6b7280", "#ef4444", "#f97316",
  "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#e5e7eb",
]

const ColorPicker = ({
  editor,
  type,
}: {
  editor: Editor | null
  type: "text" | "highlight"
}) => {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState("#000000")
  const nativeRef = useRef<HTMLInputElement>(null)

  const getEditorColor = () => {
    if (!editor) return ""
    return type === "text"
      ? (editor.getAttributes("textStyle").color || "")
      : (editor.getAttributes("highlight").color || "")
  }

  const handleOpenChange = (v: boolean) => {
    if (v) {
      const cur = getEditorColor()
      if (cur && /^#[0-9a-fA-F]{6}/i.test(cur)) setHex(cur.slice(0, 7))
    }
    setOpen(v)
  }

  const applyColor = (color: string) => {
    if (!editor) return
    if (type === "text") editor.chain().focus().setColor(color).run()
    else editor.chain().focus().toggleHighlight({ color }).run()
    setHex(color.slice(0, 7))
  }

  const clearColor = () => {
    if (!editor) return
    if (type === "text") editor.chain().focus().unsetColor().run()
    else editor.chain().focus().unsetHighlight().run()
  }

  const activeColor = getEditorColor()

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 relative"
          title={type === "text" ? "Text Color" : "Highlight"}
        >
          {type === "text" ? <Palette className="h-4 w-4" /> : <Highlighter className="h-4 w-4" />}
          {activeColor && (
            <span
              className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-background"
              style={{ backgroundColor: activeColor }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3 space-y-3" align="start">
        {/* Swatch + hex input */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0 rounded border border-border overflow-hidden cursor-pointer">
            <div className="absolute inset-0" style={{ backgroundColor: hex }} />
            <input
              ref={nativeRef}
              type="color"
              value={hex}
              onChange={(e) => applyColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={hex}
            onChange={(e) => {
              setHex(e.target.value)
              if (/^#[0-9a-fA-F]{6}$/i.test(e.target.value)) applyColor(e.target.value)
            }}
            className="h-8 flex-1 font-mono text-xs"
            placeholder="#000000"
            spellCheck={false}
          />
        </div>
        {/* Preset swatches */}
        <div className="grid grid-cols-6 gap-1">
          {PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => applyColor(color)}
            />
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="w-full text-xs" onClick={clearColor}>
          Clear {type === "text" ? "Color" : "Highlight"}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

const LinkEditor = ({ editor }: { editor: Editor | null }) => {
  const [url, setUrl] = useState("")
  const [open, setOpen] = useState(false)

  const setLink = useCallback(() => {
    if (!editor) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
    setOpen(false)
    setUrl("")
  }, [editor, url])

  const removeLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
    setOpen(false)
  }, [editor])

  const openPopover = () => {
    if (editor?.isActive("link")) {
      const attrs = editor.getAttributes("link")
      setUrl(attrs.href || "")
    }
    setOpen(true)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openPopover}
          className={cn("h-7 w-7 p-0", editor?.isActive("link") && "bg-muted text-foreground")}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setLink()
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={setLink} className="flex-1">Apply</Button>
            {editor?.isActive("link") && (
              <Button size="sm" variant="outline" onClick={removeLink}>
                <Unlink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
  minimal = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "text-primary underline" },
        },
        underline: {},
      }),
      TextStyleKit.configure({
        color: {},
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[60px] px-3 py-2 bg-[#e5e7eb]",
          "prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-blockquote:my-2",
          "[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs",
          "[&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-medium [&_h6]:font-medium",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-foreground [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/50 [&_blockquote]:rounded-r [&_blockquote]:py-2 [&_blockquote]:pr-3",
          "[&_hr]:border-t [&_hr]:border-border [&_hr]:my-3"
        ),
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className={cn("border border-input rounded-lg bg-background", className)}>
        <div className="h-[100px] animate-pulse bg-muted rounded-lg" />
      </div>
    )
  }

  return (
    <div className={cn("border border-input rounded-lg overflow-hidden", className)}>
      <div className={cn("flex flex-wrap items-center gap-0.5 p-1 border-b border-border bg-muted/30", minimal && "p-0.5")}>
        <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo className="h-4 w-4" />
        </MenuButton>
        <div className="w-px h-5 bg-border mx-1" />
        {!minimal && (
          <>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
              <Heading1 className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
              <Heading3 className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive("heading", { level: 4 })} title="Heading 4">
              <Heading4 className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} isActive={editor.isActive("heading", { level: 5 })} title="Heading 5">
              <Heading5 className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} isActive={editor.isActive("heading", { level: 6 })} title="Heading 6">
              <Heading6 className="h-4 w-4" />
            </MenuButton>
            <div className="w-px h-5 bg-border mx-1" />
          </>
        )}
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ColorPicker editor={editor} type="text" />
        <ColorPicker editor={editor} type="highlight" />
        <div className="w-px h-5 bg-border mx-1" />
        <LinkEditor editor={editor} />
        {!minimal && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
              <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Blockquote">
              <Quote className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
              <Minus className="h-4 w-4" />
            </MenuButton>
          </>
        )}
      </div>
      <EditorContent editor={editor} className="text-foreground" />
    </div>
  )
}

export function InlineRichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
}: Omit<RichTextEditorProps, "minimal">) {
  return <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} className={className} minimal />
}
