import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, Button, Tooltip, Divider } from '@serviceops/component';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import { useStyles } from './styles';

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
  icon?: React.ReactNode;
  title?: string;
  showFooterActions?: boolean;
}

export const parseRichText = (text: string): RichTextValue => {
  const segments: RichTextSegment[] = [];
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

export const serializeRichText = (segments: RichTextSegment[]): string => {
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

const RichTextEditor = ({
  value,
  onChange,
  accent = '#2d5ebb',
  placeholder = 'Describe the issue in detail...',
  showFooterActions = true,
}: Props) => {
  const { classes } = useStyles();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (value.segments.length > 0) {
        editorRef.current.innerHTML = serializeToHtml(value.segments);
      } else {
        editorRef.current.innerHTML = '';
      }
    }
  }, [value]);

  const serializeToHtml = (segments: RichTextSegment[]): string => {
    return segments
      .map((s) => {
        let text = s.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        text = text.replace(/\n/g, '<br>');
        const styles = [];
        if (s.bold) styles.push('font-weight:700');
        if (s.italic) styles.push('font-style:italic');
        if (s.underline) styles.push('text-decoration:underline');
        const styleAttr = styles.length ? ` style="${styles.join(';')}"` : '';
        return `<span${styleAttr}>${text}</span>`;
      })
      .join('');
  };

  const parseHtmlToSegments = (html: string): RichTextSegment[] => {
    const segments: RichTextSegment[] = [];
    const div = document.createElement('div');
    div.innerHTML = html;

    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) segments.push({ text });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // Recursively check if element or any child has formatting
        const hasBold =
          el.tagName === 'B' ||
          el.tagName === 'STRONG' ||
          el.style.fontWeight === '700' ||
          el.querySelector('b, strong, [style*="font-weight:700"]') !== null;
        const hasItalic =
          el.tagName === 'I' ||
          el.tagName === 'EM' ||
          el.style.fontStyle === 'italic' ||
          el.querySelector('i, em, [style*="font-style:italic"]') !== null;
        const hasUnderline =
          el.tagName === 'U' ||
          el.style.textDecoration === 'underline' ||
          el.querySelector('u, [style*="text-decoration:underline"]') !== null;

        // If no children, just process this element
        if (el.childNodes.length === 0) {
          const text = el.textContent || '';
          if (text) {
            segments.push({
              text: text.replace(/<br>/gi, '\n'),
              bold: hasBold,
              italic: hasItalic,
              underline: hasUnderline,
            });
          }
        } else {
          // Process children individually
          el.childNodes.forEach((child) => processNode(child));
        }
      }
    };

    div.childNodes.forEach(processNode);
    return segments;
  };

  const checkActiveFormats = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer.parentElement;

    let bold = false;
    let italic = false;
    let underline = false;

    while (element && element !== editorRef.current) {
      const style = window.getComputedStyle(element);
      if (style.fontWeight === '700') bold = true;
      if (style.fontStyle === 'italic') italic = true;
      if (style.textDecoration === 'underline') underline = true;
      element = element.parentElement as HTMLElement;
    }

    setActiveFormats({ bold, italic, underline });
  }, []);

  const handleFormat = useCallback(
    (command: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        const segments = parseHtmlToSegments(html);
        onChange?.({ segments });
      }
      checkActiveFormats();
    },
    [checkActiveFormats, onChange],
  );

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      const segments = parseHtmlToSegments(html);
      onChange({ segments });
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const segments = parseHtmlToSegments(html);
      if (onChange) {
        onChange({ segments });
      }
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      onChange?.({ segments: [] });
    }
  };

  const handleImageInsert = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editorRef.current) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        editorRef.current?.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<img src="${src}" style="max-width:100%;height:auto;border-radius:4px;margin:4px 0;" alt="image"/>`,
        );
        if (editorRef.current) {
          const html = editorRef.current.innerHTML;
          const segments = parseHtmlToSegments(html);
          onChange?.({ segments });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onChange],
  );

  return (
    <Box sx={{ width: '100%', mt: 1.5 }}>
      <Box
        sx={{
          border: '1px solid #2d5ebb',
          borderRadius: 2,
          overflow: 'hidden',
          '&:focus-within': {
            borderColor: accent,
            borderWidth: 1,
          },
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
              Sticky note
            </Box>
          </Box>
          <Tooltip title='Bold'>
            <IconButton
              size='small'
              sx={getFormatBtnSx(activeFormats.bold)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat('bold');
              }}
            >
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Italic'>
            <IconButton
              size='small'
              sx={getFormatBtnSx(activeFormats.italic)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat('italic');
              }}
            >
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Underline'>
            <IconButton
              size='small'
              sx={getFormatBtnSx(activeFormats.underline)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat('underline');
              }}
            >
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
          <Tooltip title='Bullet List'>
            <IconButton
              size='small'
              sx={toolbarBtnSx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat('insertUnorderedList');
              }}
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Numbered List'>
            <IconButton
              size='small'
              sx={toolbarBtnSx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat('insertOrderedList');
              }}
            >
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
          <Tooltip title='Insert Image'>
            <IconButton
              size='small'
              sx={toolbarBtnSx}
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageOutlinedIcon />
            </IconButton>
          </Tooltip>
          <input
            ref={imageInputRef}
            type='file'
            accept='image/*'
            hidden
            onChange={handleImageInsert}
          />
        </Box>

        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={checkActiveFormats}
          onMouseUp={checkActiveFormats}
          className={classes.editor}
          data-placeholder={placeholder}
          sx={{ direction: 'ltr', textAlign: 'left' }}
        />
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
              '&:hover': {
                borderColor: '#2d5ebb',
                bgcolor: 'rgba(45, 94, 187, 0.08)',
              },
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
