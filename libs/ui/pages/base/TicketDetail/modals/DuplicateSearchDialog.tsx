import { useState, useMemo, useEffect } from 'react';
import { Box, Modal, Typography, TextField, List, ListItem, ListItemText } from '../../../../components';
import { constants } from '@serviceops/utils';
import { TicketEntity } from '../types/ticketDetail.types';
import SearchIcon from '@mui/icons-material/Search';
import { alpha, darken } from '@mui/material';

/** Strip RE/FW prefixes and special/punctuation characters so titles can be loosely compared */
export const normalizeTitle = (title: string | null | undefined): string =>
  (title ?? '')
    .replace(/^(RE|FW)\s*[:\-]?\s*/i, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

interface DuplicateSearchDialogProps {
  open: boolean;
  onClose: () => void;
  currentTitle: string | null | undefined;
  allTickets: TicketEntity[];
  currentTicketId: number;
}

const SEARCH_ACCENT = '#0369a1';

const DuplicateSearchDialog = ({
  open,
  onClose,
  currentTitle,
  allTickets,
  currentTicketId,
}: DuplicateSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState(currentTitle ?? '');
  const normalizedQuery = useMemo(() => normalizeTitle(searchQuery), [searchQuery]);

  const results = useMemo<TicketEntity[]>(() => {
    if (!normalizedQuery || !allTickets.length) return [];
    return allTickets
      .filter(
        (t) => t.id !== currentTicketId && normalizeTitle(t.shortDescription) === normalizedQuery,
      )
      .slice(0, 20);
  }, [normalizedQuery, allTickets, currentTicketId]);

  const handleNavigate = (num: string) => {
    onClose();
    const detailUrl = `${window.location.origin}${constants.BasePath.TICKET_DETAIL.replace(':number', num)}`;
    window.open(detailUrl, '_blank');
  };

  // Reset search field when the dialog opens for a new ticket
  useEffect(() => {
    if (open) setSearchQuery(currentTitle ?? '');
  }, [open, currentTitle]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBackground={`linear-gradient(135deg, ${darken(SEARCH_ACCENT, 0.18)} 0%, ${SEARCH_ACCENT} 100%)`}
      headerTextColor='#fff'
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}
            >
              Search for Duplicates
            </Typography>
            <Typography
              sx={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.3,
              }}
            >
              Search by title (ignoring RE, FW, and special characters)
            </Typography>
          </Box>
        </Box>
      }
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          autoFocus
          fullWidth
          size='small'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Type a title to search for duplicates...'
        />

        {normalizedQuery ? (
          results.length > 0 ? (
            <List dense disablePadding>
              {results.map((t) => (
                <ListItem
                  key={t.id}
                  onClick={() => handleNavigate(t.number)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    border: '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(99,102,241,0.06)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {t.number}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {t.shortDescription || '(no description)'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
            >
              No duplicate tickets found.
            </Typography>
          )
        ) : (
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
          >
            Type a title above to search for duplicates.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default DuplicateSearchDialog;
