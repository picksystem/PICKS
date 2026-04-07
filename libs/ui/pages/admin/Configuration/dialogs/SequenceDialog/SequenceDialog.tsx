import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ITicketType } from '@serviceops/interfaces';
import { useReorderTicketTypesMutation } from '@serviceops/services';
import { getTypeColor } from '../../utils/ticketTypeIcons';

interface SequenceDialogProps {
  open: boolean;
  ticketTypes: ITicketType[];
  onClose: () => void;
  onSave: () => void;
}

const SequenceDialog = ({ open, ticketTypes, onClose, onSave }: SequenceDialogProps) => {
  const [ordered, setOrdered] = useState<ITicketType[]>([]);
  const [reorderTicketTypes, { isLoading }] = useReorderTicketTypesMutation();

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
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIndicatorIcon sx={{ color: 'primary.main' }} />
          Ticket Type Display Sequence
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 400, mt: 0.5 }}>
          Use the arrows to reorder how ticket types appear on the Create Ticket page.
        </Typography>
      </DialogTitle>

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
                        {t.displayName || t.name}
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
                  secondary={t.description || t.type}
                  secondaryTypographyProps={{ fontSize: '0.75rem', noWrap: true }}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' }, textTransform: 'none' },
        }}
      >
        <Button onClick={onClose} disabled={isLoading} variant='outlined' color='inherit'>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={14} color='inherit' /> : undefined}
          sx={{ minWidth: { sm: 120 } }}
        >
          {isLoading ? 'Saving...' : 'Save Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SequenceDialog;
