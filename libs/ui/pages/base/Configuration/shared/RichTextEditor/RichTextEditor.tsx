import React, { useRef, useCallback, useEffect } from 'react';
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

interface Props {
  value: RichTextValue;
  onChange?: (value: RichTextValue) => void;
  accent?: string;
  placeholder?: string;
  title?: string;
  showFooterActions?: boolean;
  icon?: React.ReactNode;
}

export const parseRichText = (text: string): RichTextValue => {
  const segments: RichTextSegment[] = [];
  if (!text || typeof text !== 'string') return { segments };

  const items = text.split(/\n+/).filter(Boolean);
  items.forEach((item) => {
    const trimmed = item.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('**') && trimmed.includes('**', 2)) {
      const end = trimmed.indexOf('**', 2);
      segments.push({ text: trimmed.slice(2, end), bold: true });
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
      segments.push({ text: trimmed.slice(1, -1), italic: true });
    } else if (trimmed.startsWith('__') && trimmed.endsWith('__')) {
      segments.push({ text: trimmed.slice(2, -2), underline: true });
    } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      segments.push({ text: trimmed.replace(/^[•\-]\s*/, ''), bold: true });
    } else if (/^\d+\.\s/.test(trimmed)) {
      segments.push({ text: trimmed.replace(/^\d+\.\s*/, ''), italic: true });
    } else {
      segments.push({ text: trimmed });
    }
  });

  return { segments };
};

export const serializeRichText = (segments: RichTextSegment[]): string => {
  if (!segments || !Array.isArray(segments)) return '';

  return segments
    .map((s) => {
      let result = s.text;
      if (s.bold) result = `**${result}**`;
      else if (s.italic) result = `*${result}*`;
      else if (s.underline) result = `__${result}__`;
      return result;
    })
    .join('\n');
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const segmentsToHtml = (segments: RichTextSegment[]): string => {
  if (!segments || !Array.isArray(segments) || segments.length === 0) return '';

  return segments
    .map((s) => {
      const safeText = escapeHtml(s.text);
      if (s.bold) return `<b>${safeText}</b>`;
      if (s.italic) return `<i>${safeText}</i>`;
      if (s.underline) return `<u>${safeText}</u>`;
      return safeText;
    })
    .join('<br>');
};

const toolbarBtnSx = {
  width: 28,
  height: 28,
  padding: 0,
  borderRadius: 1,
  color: '#0369a1',
};

const RichTextEditor = ({
  value,
  onChange,
  accent = '#2d5ebb',
  title = 'Internal Note',
  showFooterActions = true,
  icon,
}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  // Track the serialized form of the value we last initialized the editor
  // from. We only re-sync when the serialized form changes AND the editor
  // is not currently focused (so we never wipe what the user is typing).
  const lastInitializedRef = useRef<string>('');
  // Track if editor currently has focus
  const isFocusedRef = useRef(false);

  const ensureEditor = useCallback(() => editorRef.current, []);

  // Sync from value prop when the serialized form changes from outside
  // (e.g. parent resets the form, or user opens a different edit item).
  // We skip the sync while the editor is focused to protect in-progress edits.
  useEffect(() => {
    const ed = ensureEditor();
    if (!ed) return;

    const incomingSerialized = serializeRichText(value?.segments ?? []);
    if (incomingSerialized === lastInitializedRef.current) return;

    if (isFocusedRef.current) return;

    const html = segmentsToHtml(value?.segments ?? []);
    ed.innerHTML = html;
    lastInitializedRef.current = incomingSerialized;
  }, [value, ensureEditor]);

  const execCmd = useCallback(
    (cmd: string, val?: string) => {
      const ed = ensureEditor();
      if (!ed) return;
      ed.focus();
      document.execCommand(cmd, false, val);
    },
    [ensureEditor],
  );

  const handleBold = () => execCmd('bold');
  const handleItalic = () => execCmd('italic');
  const handleUnderline = () => execCmd('underline');
  const handleBullet = () => execCmd('insertUnorderedList');
  const handleNumber = () => execCmd('insertOrderedList');

  const handleSave = useCallback(() => {
    const ed = ensureEditor();
    if (!ed || !onChange) return;

    const html = ed.innerHTML;
    if (!html || html === '<br>') {
      onChange({ segments: [] });
      return;
    }

    const segments: RichTextSegment[] = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Handle lists
    const ul = tempDiv.querySelector('ul');
    const ol = tempDiv.querySelector('ol');

    if (ul) {
      ul.querySelectorAll('li').forEach((li) => {
        const text = li.textContent?.trim();
        if (text) segments.push({ text, bold: true });
      });
    } else if (ol) {
      ol.querySelectorAll('li').forEach((li) => {
        const text = li.textContent?.trim();
        if (text) segments.push({ text, italic: true });
      });
    } else {
      // Track which text nodes have already been claimed by a formatting
      // element so we don't double-count them in the plain-text fallback.
      const claimed = new Set<Element>();
      tempDiv.querySelectorAll('b, strong').forEach((el) => {
        const text = el.textContent?.trim();
        if (text) segments.push({ text, bold: true });
        claimed.add(el);
      });
      tempDiv.querySelectorAll('i, em').forEach((el) => {
        const text = el.textContent?.trim();
        if (text) segments.push({ text, italic: true });
        claimed.add(el);
      });
      tempDiv.querySelectorAll('u').forEach((el) => {
        const text = el.textContent?.trim();
        if (text) segments.push({ text, underline: true });
        claimed.add(el);
      });
      // Capture plain text from block-level wrappers (p, div) that don't
      // already contain formatting. This handles both <div>Hello</div>
      // (Chrome) and bare "Hello" (Firefox) shapes.
      tempDiv.querySelectorAll('p, div').forEach((el) => {
        if (el.querySelector('b, strong, i, em, u, ul, ol')) return;
        const text = el.textContent?.trim();
        if (text) segments.push({ text });
      });

      // If we still have no segments, the browser stored the text without
      // any block-level wrapper. Fall back to the raw textContent so the
      // user's input is never silently dropped.
      if (segments.length === 0) {
        const rawText = tempDiv.textContent?.trim();
        if (rawText) {
          // Preserve line breaks the user typed (Enter inserts <br> or new
          // block elements; both are already normalized into newlines by
          // the browser before we read innerHTML).
          const lines = rawText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
          lines.forEach((line) => segments.push({ text: line }));
        }
      }
    }

    onChange({ segments });
  }, [ensureEditor, onChange]);

  const handleClear = useCallback(() => {
    const ed = ensureEditor();
    if (ed) {
      ed.innerHTML = '';
      onChange?.({ segments: [] });
    }
  }, [ensureEditor, onChange]);

  return (
    <Box sx={{ width: '100%', mt: 1.5 }}>
      <Box sx={{ border: `1px solid ${accent}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            bgcolor: '#f0f4f8',
            borderBottom: `1px solid ${accent}`,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
            {icon ?? <StickyNote2Icon sx={{ fontSize: 16, color: '#0369a1' }} />}
            <Box sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1' }}>{title}</Box>
          </Box>
          <Tooltip title='Bold'>
            <IconButton size='small' sx={toolbarBtnSx} onClick={handleBold}>
              <FormatBoldIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Italic'>
            <IconButton size='small' sx={toolbarBtnSx} onClick={handleItalic}>
              <FormatItalicIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Underline'>
            <IconButton size='small' sx={toolbarBtnSx} onClick={handleUnderline}>
              <FormatUnderlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
          <Tooltip title='Bullet List'>
            <IconButton size='small' sx={toolbarBtnSx} onClick={handleBullet}>
              <FormatListBulletedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Numbered List'>
            <IconButton size='small' sx={toolbarBtnSx} onClick={handleNumber}>
              <FormatListNumberedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            handleSave();
          }}
          sx={{
            p: 1,
            minHeight: 80,
            outline: 'none',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
        />
      </Box>

      {showFooterActions && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
          <Button
            size='small'
            variant='outlined'
            startIcon={<ClearIcon />}
            onClick={handleClear}
            sx={{ minWidth: 80, borderColor: accent, color: accent }}
          >
            Clear
          </Button>
          <Button
            size='small'
            variant='contained'
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ minWidth: 80, bgcolor: accent }}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RichTextEditor;
