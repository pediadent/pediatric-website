'use client'

import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const buttonBaseClasses =
  'inline-flex items-center justify-center rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const [isCodeView, setIsCodeView] = useState(false)
  const [codeDraft, setCodeDraft] = useState(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-lg bg-neutral-900 p-4 text-sm text-white font-mono'
          }
        }
      }),
      Underline,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Link.configure({
        autolink: false,
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-primary-600 underline decoration-primary-400 hover:text-primary-700'
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Image.configure({
        allowBase64: true
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border border-neutral-300 w-full'
        }
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[22rem] rounded-lg border border-neutral-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500'
      }
    },
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      if (!isCodeView) {
        setCodeDraft(html)
      }
    },
    immediatelyRender: false
  })

  useEffect(() => {
    if (!editor) return
    if (isCodeView) {
      setCodeDraft(content)
      return
    }
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor, isCodeView])

  const toggleCodeView = () => {
    if (!editor) return
    if (!isCodeView) {
      setCodeDraft(editor.getHTML())
      setIsCodeView(true)
      return
    }
    editor.commands.setContent(codeDraft, false)
    setIsCodeView(false)
  }

  const applyLink = () => {
    const url = window.prompt('Enter URL')
    if (!url) return
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
  }

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (!url) return
    editor?.chain().focus().setImage({ src: url, alt: 'Image' }).run()
  }

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addColumn = () => editor?.chain().focus().addColumnAfter().run()
  const addRow = () => editor?.chain().focus().addRowAfter().run()
  const deleteTable = () => editor?.chain().focus().deleteTable().run()

  const headingValue = useMemo(() => {
    if (!editor) return ''
    if (editor.isActive('heading', { level: 1 })) return '1'
    if (editor.isActive('heading', { level: 2 })) return '2'
    if (editor.isActive('heading', { level: 3 })) return '3'
    return ''
  }, [editor, editor?.state?.selection])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2">
          <select
            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-700"
            value={headingValue}
            disabled={!editor || isCodeView}
            onChange={(event) => {
              if (!editor) return
              const value = event.target.value
              if (!value) {
                editor.chain().focus().setParagraph().run()
              } else {
                const level = parseInt(value, 10)
                editor.chain().focus().setHeading({ level }).run()
              }
            }}
          >
            <option value="">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>

          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()}>
            Bold
          </button>
          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            Italic
          </button>
          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            Underline
          </button>
          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleStrike().run()}>
            Strike
          </button>
          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
            Code Block
          </button>
          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            • List
          </button>
          <button className={buttonBaseClasses} type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            1. List
          </button>

          <input
            type="color"
            className="h-8 w-8 cursor-pointer rounded-md border border-neutral-300"
            value={editor?.getAttributes('textStyle').color || '#000000'}
            onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()}
            disabled={!editor}
          />

          <button className={buttonBaseClasses} type="button" onClick={applyLink} disabled={!editor}>
            Link
          </button>
          <button className={buttonBaseClasses} type="button" onClick={removeLink} disabled={!editor}>
            Unlink
          </button>
          <button className={buttonBaseClasses} type="button" onClick={addImage} disabled={!editor}>
            Image
          </button>

          <div className="flex items-center gap-1">
            <button className={buttonBaseClasses} type="button" onClick={insertTable} disabled={!editor}>
              Table
            </button>
            <button className={buttonBaseClasses} type="button" onClick={addColumn} disabled={!editor}>
              + Col
            </button>
            <button className={buttonBaseClasses} type="button" onClick={addRow} disabled={!editor}>
              + Row
            </button>
            <button className={buttonBaseClasses} type="button" onClick={deleteTable} disabled={!editor}>
              Remove Table
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleCodeView}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          {isCodeView ? 'Visual Editor' : 'Code Editor'}
        </button>
      </div>

      {isCodeView ? (
        <textarea
          value={codeDraft}
          onChange={(event) => setCodeDraft(event.target.value)}
          className="h-80 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
}
