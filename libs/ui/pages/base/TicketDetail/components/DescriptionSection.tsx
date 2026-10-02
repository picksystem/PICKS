import { useState } from 'react';
import { TextField, Typography, Box, Collapse } from '@mui/material';
import { RichTextEditor } from '../../Configuration/shared/RichTextEditor';
import { useStyles } from '../styles';
import { TicketEntity, TicketUpdateInput } from '../types/ticketDetail.types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/* ------------------------------------------------------------------ */
/*  Helpers: convert between plain-text/HTML and the RichTextValue    */
/*  segment format the editor expects.                                */
/* ------------------------------------------------------------------ */

const htmlToPlainText = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent?.trim() ?? '';
};

/** Build a RichTextValue from a plain-text or HTML string */
const toRichTextValue = (raw: string | undefined | null): { segments: { text: string }[] } => {
  if (!raw) return { segments: [] };

  // If it already contains HTML tags, extract the text and treat each
  // non-empty line as its own plain segment.
  const text = raw.includes('<') ? htmlToPlainText(raw) : raw;

  const segments = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => ({ text: line }) as { text: string });

  return { segments };
};

/** Convert RichTextValue back to a plain-text string for storage */
const richTextValueToString = (value: { segments?: { text: string }[] }): string =>
  value.segments?.map((s) => s.text).join('\n') ?? '';

interface DescriptionSectionProps {
  incident: TicketEntity;
  isEditing: boolean;
  editFormData: TicketUpdateInput;
  onEditFormChange: (data: Partial<TicketUpdateInput>) => void;
}

const DescriptionSection = ({
  incident,
  isEditing,
  editFormData,
  onEditFormChange,
}: DescriptionSectionProps) => {
  const { classes } = useStyles();
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  // Memoise the RichTextValue so the editor only re-initialises when the
  // *source* string actually changes (not on every parent render).
  const richTextValue = toRichTextValue(editFormData.description ?? incident.description);

  const handleDescriptionChange = (value: { segments?: { text: string }[] }) => {
    onEditFormChange({ description: richTextValueToString(value) });
  };

  return (
    <Box className={classes.descriptionCard}>
      {/* Clickable Header */}
      <Box
        className={classes.descriptionCardHeader}
        onClick={() => setDescriptionOpen(!descriptionOpen)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
          },
        }}
      >
        <Typography className={classes.descriptionSectionTitle}>Description</Typography>
        <ExpandMoreIcon
          className={classes.descriptionChevron}
          sx={{
            transition: 'transform 0.3s ease',
            transform: descriptionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#6366f1',
            fontSize: '1.1rem',
          }}
        />
      </Box>

      {/* Collapsible Body */}
      <Collapse in={descriptionOpen} timeout='auto' unmountOnExit>
        <Box className={classes.descriptionCardBody}>
          {isEditing ? (
            <>
              <TextField
                label='Short Description'
                fullWidth
                size='small'
                required
                value={editFormData.shortDescription ?? incident.shortDescription ?? ''}
                onChange={(e) => onEditFormChange({ shortDescription: e.target.value })}
                className={classes.descriptionTextField}
              />
              <Box className={classes.descriptionRichTextEditor}>
                <RichTextEditor
                  value={richTextValue}
                  onChange={handleDescriptionChange}
                  title='Description'
                  placeholder='Describe the issue in detail...'
                  showFooterActions={false}
                  required
                />
              </Box>
            </>
          ) : (
            <>
              <Typography className={classes.descriptionShortTitle}>
                {incident.shortDescription || 'No short description'}
              </Typography>
              <Typography className={classes.descriptionBodyText}>
                {incident.description || 'No description provided'}
              </Typography>
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default DescriptionSection;
