import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Modal,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '../../../../components';
import { useNavigate } from 'react-router-dom';
import { constants } from '@serviceops/utils';
import { TicketEntity } from '../types/ticketDetail.types';

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

const DuplicateSearchDialog = ({
  open,
  onClose,
  currentTitle,
  allTickets,
  currentTicketId,
}: DuplicateSearchDialogProps) => {
  const navigate = useNavigate();
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
    navigate(constants.BasePath.TICKET_DETAIL.replace(':number', num));
  };

  // Reset search field when the dialog opens for a new ticket
  useEffect(() => {
    if (open) setSearchQuery(currentTitle ?? '');
  }, [open, currentTitle]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          maxHeight: '70vh',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Search for Duplicates
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3, py: 2, overflowY: 'auto', flex: 1 }}>
          <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
            Search by title (ignoring RE, FW, and special characters):
          </Typography>

          <TextField
            autoFocus
            fullWidth
            size='small'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Type a title to search for duplicates...'
            sx={{ mb: 2 }}
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
      </Box>
    </Modal>
  );
};

export default DuplicateSearchDialog;
