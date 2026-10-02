import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Modal,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '../../../../components';
import { constants } from '@serviceops/utils';
import { TicketEntity } from '../types/ticketDetail.types';
import SearchIcon from '@mui/icons-material/Search';
import { darken } from '@mui/material';

/** Strip RE/FW prefixes and special/punctuation characters so titles/descriptions can be loosely compared */
export const normalizeText = (text: string | null | undefined): string =>
  (text ?? '')
    .replace(/^(RE|FW)\s*[:\-]?\s*/i, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

interface TicketSearchDialogProps {
  open: boolean;
  onClose: () => void;
  allTickets: TicketEntity[];
  currentTicketId: number;
}

const SEARCH_ACCENT = '#0369a1';

const TicketSearchDialog = ({
  open,
  onClose,
  allTickets,
  currentTicketId,
}: TicketSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const results = useMemo<TicketEntity[]>(() => {
    if (!normalizedQuery || !allTickets.length) return [];
    const words = normalizedQuery.split(' ').filter(Boolean);
    return allTickets
      .filter((t) => {
        if (t.id === currentTicketId) return false;
        const title = normalizeText(t.shortDescription);
        const desc = normalizeText(t.description);
        // Match if ALL words from the query appear in title OR description
        return words.every((w) => title.includes(w) || desc.includes(w));
      })
      .slice(0, 20);
  }, [normalizedQuery, allTickets, currentTicketId]);

  const handleNavigate = (num: string) => {
    onClose();
    const detailUrl = `${window.location.origin}${constants.BasePath.TICKET_DETAIL.replace(':number', num)}`;
    window.open(detailUrl, '_blank');
  };

  // Reset search when dialog opens
  useEffect(() => {
    if (open) setSearchQuery('');
  }, [open]);

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
              Search Tickets
            </Typography>
            <Typography
              sx={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.3,
              }}
            >
              Search by title or description (ignoring RE, FW, and special characters)
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
          placeholder='Search tickets by title or description...'
        />

        {normalizedQuery ? (
          results.length > 0 ? (
            <List dense disablePadding>
              {results.map((t) => {
                const normTitle = normalizeText(t.shortDescription);
                const normDesc = normalizeText(t.description);
                const matchedWords = normalizedQuery
                  .split(' ')
                  .filter(Boolean)
                  .filter((w) => normTitle.includes(w) || normDesc.includes(w));
                const matchInTitle = matchedWords.some((w) => normTitle.includes(w));
                return (
                  <ListItem
                    key={t.id}
                    onClick={() => handleNavigate(t.number)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      border: '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.06)' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {t.number}
                          </Typography>
                          {matchInTitle && (
                            <Chip
                              label='Title'
                              size='small'
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                              color='primary'
                              variant='outlined'
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          {t.shortDescription || '(no description)'}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
            >
              No tickets found matching your search.
            </Typography>
          )
        ) : (
          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Type a title or description above to search for matching tickets.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default TicketSearchDialog;
