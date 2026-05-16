import { useRef, useEffect, useCallback } from 'react';
import { IconButton, Tooltip, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Typography, TextField, Checkbox } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from '../styles';

interface DescriptionSectionProps {
  values: {
    shortDescription: string;
    description: string;
    isRecurring: boolean;
    isMajor: boolean;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
  onCheckboxChange: (field: string, value: boolean) => void;
  onDescriptionChange: (html: string) => void;
  onAddAttachment: (files: FileList) => void;
}

const toolbarBtnSx = {
  width: 30,
  height: 30,
  borderRadius: 1,
  color: 'text.secondary',
  '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' },
  '& svg': { fontSize: '1.1rem' },
};

const DescriptionSection = ({
  values,
  touched,
  errors,
  onChange,
  onBlur,
  onCheckboxChange,
  onDescriptionChange,
  onAddAttachment,
}: DescriptionSectionProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  // Initialize editor with existing value on mount only
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = values.description || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external description changes only when editor is not focused
  useEffect(() => {
    if (!isFocused.current && editorRef.current) {
      const current = editorRef.current.innerHTML;
      if (current !== values.description) {
        editorRef.current.innerHTML = values.description || '';
      }
    }
  }, [values.description]);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      onDescriptionChange(editorRef.current.innerHTML);
    }
  }, [onDescriptionChange]);

  const applyFormat = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onDescriptionChange(editorRef.current.innerHTML);
      }
    },
    [onDescriptionChange],
  );

  const handleImageInsert = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        editorRef.current?.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<img src="${src}" style="max-width:100%;height:auto;border-radius:4px;margin:4px 0;" alt="image"/>`,
        );
        if (editorRef.current) onDescriptionChange(editorRef.current.innerHTML);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onDescriptionChange],
  );

  const hasError = !!(touched.description && errors.description);

  return (
    <>
      <Typography className={classes.sectionTitle}>Description</Typography>
      <Box className={classes.formGrid}>
        {/* Short Description */}
        <Box className={classes.fullWidth}>
          <TextField
            name='shortDescription'
            label='Short Description / Title'
            value={values.shortDescription}
            onChange={onChange}
            onBlur={onBlur}
            inputProps={{ maxLength: 120 }}
            error={!!(touched.shortDescription && errors.shortDescription)}
            errorText={reqError(touched.shortDescription, errors.shortDescription)}
            required
          />
        </Box>

        {/* Rich Text Description */}
        <Box className={classes.fullWidth}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: 0.5,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
            }}
          >
            Description <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <Box
            sx={{
              border: hasError ? '1px solid #d32f2f' : '1px solid rgba(0,0,0,0.23)',
              borderRadius: 2,
              overflow: 'hidden',
              '&:focus-within': {
                borderColor: hasError ? '#d32f2f' : 'primary.main',
                borderWidth: '2px',
              },
            }}
          >
            {/* Toolbar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1,
                py: 0.5,
                backgroundColor: 'grey.50',
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap',
              }}
            >
              <Tooltip title='Bold'>
                <IconButton
                  size='small'
                  sx={toolbarBtnSx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('bold');
                  }}
                >
                  <FormatBoldIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Italic'>
                <IconButton
                  size='small'
                  sx={toolbarBtnSx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('italic');
                  }}
                >
                  <FormatItalicIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Underline'>
                <IconButton
                  size='small'
                  sx={toolbarBtnSx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('underline');
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
                    applyFormat('insertUnorderedList');
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
                    applyFormat('insertOrderedList');
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

            {/* Editable area */}
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onFocus={() => {
                isFocused.current = true;
              }}
              onBlur={() => {
                isFocused.current = false;
              }}
              sx={{
                minHeight: 140,
                padding: '10px 14px',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                outline: 'none',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                color: 'text.primary',
                '&:empty::before': {
                  content: '"Describe the issue in detail..."',
                  color: 'text.disabled',
                  pointerEvents: 'none',
                },
                '& ul, & ol': { paddingLeft: '1.5em', margin: '4px 0' },
                '& img': { maxWidth: '100%' },
              }}
            />
          </Box>
          {hasError && (
            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
              {reqError(touched.description, errors.description)}
            </Box>
          )}
        </Box>

        {/* Checkboxes + Add Attachment */}
        <Box
          className={classes.fullWidth}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box className={classes.checkboxRow}>
            <Checkbox
              label='Major Ticket'
              checked={values.isMajor}
              onChange={(_, checked) => onCheckboxChange('isMajor', checked)}
            />
            <Checkbox
              label='Recurring Ticket'
              checked={values.isRecurring}
              onChange={(_, checked) => onCheckboxChange('isRecurring', checked)}
            />
          </Box>
          <Tooltip title='Add attachment'>
            <IconButton
              size='small'
              onClick={() => attachInputRef.current?.click()}
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                gap: 0.5,
                fontSize: '0.8rem',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
            >
              <AttachFileIcon sx={{ fontSize: '1rem' }} />
              Add Attachment
            </IconButton>
          </Tooltip>
          <input
            ref={attachInputRef}
            type='file'
            multiple
            accept='.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif'
            hidden
            onChange={(e) => e.target.files && onAddAttachment(e.target.files)}
          />
        </Box>
      </Box>
    </>
  );
};

export default DescriptionSection;
