import { useState, useEffect } from 'react';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@serviceops/component';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { SequenceDialogProps } from './util';
import { ITicketType } from '@serviceops/interfaces';
import { useReorderTicketTypesMutation } from '@serviceops/services';
import { useNotification } from '@serviceops/hooks';
import { getTypeColor } from '../../utils/ticketTypeIcons';

const ACCENT = '#0369a1';

const SequenceDialog = ({ open, ticketTypes, onClose, onSave }: SequenceDialogProps) => {
  const [ordered, setOrdered] = useState<ITicketType[]>([]);
  const [reorderTicketTypes, { isLoading }] = useReorderTicketTypesMutation();
  const { success } = useNotification();

  useEffect(() => {
    if (!open) return;
    const sorted = [...ticketTypes].sort((a, b) => a.displayOrder - b.displayOrder);
    setOrdered(sorted);
  }, [open, ticketTypes]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    setOrdered((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === ordered.length - 1) return;
    setOrdered((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    const orders = ordered.map((t, i) => ({ id: t.id, displayOrder: i + 1 }));
    await reorderTicketTypes(orders).unwrap();
    success('Display sequence updated successfully');
    onSave();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT} 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <DragIndicatorIcon />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            Ticket Type Display Sequence
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
            Use the arrows to reorder how ticket types appear on the Create Ticket page.
          </Typography>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <List disablePadding>
          {ordered.map((t, index) => {
            const color = getTypeColor(t.type);
            return (
              <ListItem
                key={t.type}
                divider={index < ordered.length - 1}
                sx={{
                  px: 2,
                  py: 1,
                  gap: 1.5,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title='Move up'>
                      <span>
                        <IconButton
                          size='small'
                          onClick={() => moveUp(index)}
                          disabled={index === 0 || isLoading}
                        >
                          <ArrowUpwardIcon fontSize='small' />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title='Move down'>
                      <span>
                        <IconButton
                          size='small'
                          onClick={() => moveDown(index)}
                          disabled={index === ordered.length - 1 || isLoading}
                        >
                          <ArrowDownwardIcon fontSize='small' />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                }
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                    {index + 1}
                  </Typography>
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600} fontSize='0.9rem'>
                        {t.name}
                      </Typography>
                      {!t.isActive && (
                        <Chip
                          label='Inactive'
                          size='small'
                          color='default'
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        flexDirection: 'column',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Typography fontSize='0.75rem' noWrap>
                        {t.displayTag}
                      </Typography>
                      <Typography fontSize='0.75rem' noWrap>
                        {t.displayName}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' }, textTransform: 'none' },
        }}
      >
        <Button onClick={onClose} disabled={isLoading} variant='outlined'>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleSave} disabled={isLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SequenceDialog;
