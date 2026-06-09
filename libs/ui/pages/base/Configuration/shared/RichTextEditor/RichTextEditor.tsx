import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Box, IconButton, Button, Tooltip, Divider } from '@serviceops/component';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';

interface RichTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface RichTextValue {
  segments: RichTextSegment[];
}

// Export parseRichText - converts text like **bold** *italic* __underline__ to segments
export const parseRichText = (text: string): RichTextValue => {
  const segments: RichTextSegment[] = [];
  if (!text) return { segments };

  let remaining = text;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    const underlineMatch = remaining.match(/^__(.+?)__/);

    if (boldMatch) {
      segments.push({ text: boldMatch[1], bold: true });
      remaining = remaining.slice(boldMatch[0].length);
    } else if (italicMatch) {
      segments.push({ text: italicMatch[1], italic: true });
      remaining = remaining.slice(italicMatch[0].length);
    } else if (underlineMatch) {
      segments.push({ text: underlineMatch[1], underline: true });
      remaining = remaining.slice(underlineMatch[0].length);
    } else {
      const nextIndex = remaining.search(/\*\*|\*|__/);
      if (nextIndex === -1) {
        segments.push({ text: remaining });
        break;
      }
      if (nextIndex > 0) {
        segments.push({ text: remaining.slice(0, nextIndex) });
        remaining = remaining.slice(nextIndex);
      } else {
        remaining = remaining.slice(1);
      }
    }
  }
  return { segments };
};

// Export serializeRichText - converts segments to text like **bold** *italic* __underline__
export const serializeRichText = (segments: RichTextSegment[]): string => {
  if (!segments) return '';
  return segments
    .map((s) => {
      let prefix = '';
      if (s.bold) prefix += '**';
      if (s.italic) prefix += '*';
      if (s.underline) prefix += '__';
      let suffix = '';
      if (s.underline) suffix = `__${suffix}`;
      if (s.italic) suffix = `*${suffix}`;
      if (s.bold) suffix = `**${suffix}`;
      return `${prefix}${s.text}${suffix}`;
    })
    .join('');
};

interface Props {
  value: RichTextValue;
  onChange?: (value: RichTextValue) => void;
  accent?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  title?: string;
  showFooterActions?: boolean;
}

const toolbarBtnSx = {
  width: 30,
  height: 30,
  borderRadius: 1,
  color: '#0369a1',
  '&:hover': { backgroundColor: 'action.hover', color: '#0369a1' },
  '& svg': { fontSize: '1.1rem' },
};

const getFormatBtnSx = (isActive: boolean) => ({
  ...toolbarBtnSx,
  bgcolor: isActive ? 'rgba(3, 105, 161, 0.08)' : 'transparent',
  border: isActive ? '1px solid #0369a1' : '1px solid transparent',
});

// Convert HTML to segments
const htmlToSegments = (html: string): RichTextSegment[] => {
  const segments: RichTextSegment[] = [];
  if (!html || html === '<p></p>') return segments;

  const div = document.createElement('div');
  div.innerHTML = html;

  const processNode = (
    node: Node,
    formatting: { bold: boolean; italic: boolean; underline: boolean },
  ) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) segments.push({ text, ...formatting });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName;
      const { style } = el;

      const newFormat = { ...formatting };
      if (
        tag === 'B' ||
        tag === 'STRONG' ||
        style.fontWeight === '700' ||
        style.fontWeight === 'bold'
      )
        newFormat.bold = true;
      if (tag === 'I' || tag === 'EM' || style.fontStyle === 'italic') newFormat.italic = true;
      if (
        tag === 'U' ||
        style.textDecorationLine === 'underline' ||
        style.textDecoration?.includes('underline')
      )
        newFormat.underline = true;

      if (el.childNodes.length === 0) {
        const text = el.textContent?.trim();
        if (text) segments.push({ text, ...newFormat });
      } else {
        Array.from(el.childNodes).forEach((child) => processNode(child, newFormat));
      }
    }
  };

  Array.from(div.childNodes).forEach((node) =>
    processNode(node, { bold: false, italic: false, underline: false }),
  );
  return segments;
};

// Convert our segments to TipTap HTML
const segmentsToHtml = (segments: RichTextSegment[]): string => {
  if (!segments || segments.length === 0) return '<p></p>';
  return segments
    .map((s) => {
      let { text } = s;
      if (s.bold) text = `<strong>${text}</strong>`;
      if (s.italic) text = `<em>${text}</em>`;
      if (s.underline) text = `<u>${text}</u>`;
      return `<p>${text}</p>`;
    })
    .join('');
};

const RichTextEditor = ({
  value,
  onChange,
  accent = '#2d5ebb',
  placeholder = 'Describe the issue in detail...',
  title = 'Internal Note',
  showFooterActions = true,
}: Props) => {
  const initialContent = value?.segments?.length > 0 ? segmentsToHtml(value.segments) : '';

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent || `<p>${placeholder}</p>`,
    onUpdate: ({ editor: ed }) => {
      if (onChange) {
        const html = ed.getHTML();
        const json = ed.getJSON();
        const segments = htmlToSegments(html);
        onChange({ segments });
      }
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 80px; padding: 8px;',
      },
    },
  });

  // Update editor when value changes from outside
  useEffect(() => {
    if (editor && value?.segments?.length > 0) {
      const newHtml = segmentsToHtml(value.segments);
      const currentHtml = editor.getHTML();
      if (newHtml !== currentHtml && newHtml !== `<p>${placeholder}</p>`) {
        editor.commands.setContent(newHtml);
      }
    }
  }, [editor, value, placeholder]);

  const handleClear = useCallback(() => {
    if (editor) {
      editor.commands.clearContent();
      onChange?.({ segments: [] });
    }
  }, [editor, onChange]);

  const handleSave = useCallback(() => {
    if (editor) {
      const html = editor.getHTML();
      const segments = htmlToSegments(html);
      onChange?.({ segments });
    }
  }, [editor, onChange]);

  if (!editor) return null;

  return (
    <Box sx={{ width: '100%', mt: 1.5 }}>
      <Box
        sx={{
          border: '1px solid #2d5ebb',
          borderRadius: 2,
          overflow: 'hidden',
          '&:focus-within': { borderColor: accent, borderWidth: 1 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            px: 1,
            py: 0.5,
            backgroundColor: '#0369a114',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              mr: 0.5,
            }}
          >
            <StickyNote2Icon sx={{ fontSize: '1rem', color: '#0369a1' }} />
            <Box
              sx={{
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                lineHeight: 1.5,
                letterSpacing: '0.00938em',
                color: '#0369a1',
                fontWeight: 700,
                fontSize: '0.92rem',
              }}
            >
              {title}
            </Box>
          </Box>
          <Tooltip title='Bold'>
            <IconButton
              size='small'
              sx={getFormatBtnSx(editor.isActive('bold'))}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Italic'>
            <IconButton
              size='small'
              sx={getFormatBtnSx(editor.isActive('italic'))}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Underline'>
            <IconButton
              size='small'
              sx={getFormatBtnSx(editor.isActive('underline'))}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
          <Tooltip title='Bullet List'>
            <IconButton
              size='small'
              sx={toolbarBtnSx}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Numbered List'>
            <IconButton
              size='small'
              sx={toolbarBtnSx}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            p: 1,
            minHeight: 80,
            '& .ProseMirror': {
              outline: 'none',
              minHeight: 60,
              '& p': { margin: 0 },
              '& ul, & ol': { paddingLeft: 3, margin: '4px 0' },
              '& li': { marginBottom: 0.5 },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {showFooterActions && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'flex-end',
            gap: 1,
            mt: 1.5,
          }}
        >
          <Button
            size='small'
            variant='outlined'
            startIcon={<ClearIcon />}
            onClick={handleClear}
            sx={{
              textTransform: 'none',
              borderColor: '#2d5ebb',
              color: '#2d5ebb',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { borderColor: '#2d5ebb', bgcolor: 'rgba(45, 94, 187, 0.08)' },
            }}
          >
            Clear
          </Button>
          <Button
            size='small'
            variant='contained'
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              bgcolor: '#2d5ebb',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { bgcolor: '#2d5ebb' },
            }}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
};

export { RichTextEditor };
export default RichTextEditor;
