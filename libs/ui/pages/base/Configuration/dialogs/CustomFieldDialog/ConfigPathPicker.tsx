import { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  alpha,
} from '@mui/material';
import { AccountTree as AccountTreeIcon } from '@mui/icons-material';
import { VISIBLE_NAV_ITEMS } from '../../Configuration';
import { PAGE_GROUP_META } from '../../config/accordionDescriptors';

interface ConfigPathPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (label: string, value: string) => void;
}

const ConfigPathPicker = ({ open, onClose, onSelect }: ConfigPathPickerProps) => {
  const [activePagePath, setActivePagePath] = useState<string>('');

  const handleConfirm = () => {
    if (!activePagePath) return;
    const pageKey = activePagePath.split('/').filter(Boolean).pop() ?? '';
    const meta = PAGE_GROUP_META[pageKey];
    if (!meta) return;
    onSelect(meta.label, activePagePath);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      disableEscapeKeyDown
      disableEnforceFocus
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { zIndex: 1500, borderRadius: 3, overflow: 'hidden', maxWidth: 900 } }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: 'linear-gradient(135deg, rgb(2, 86, 132) 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 90,
            height: 90,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
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
            position: 'relative',
            zIndex: 1,
          }}
        >
          <AccountTreeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            Select Configuration Value
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
            Browse and select a configuration value from the system
          </Typography>
        </Box>
      </Box>

      {/* 3-Column Navigation */}
      <DialogContent dividers sx={{ p: 0, overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' }}>
        <Box sx={{ display: 'flex', minHeight: 380 }}>
          {/* Column 1: Pages */}
          <Box
            sx={{
              flex: 1,
              borderRight: '1px solid',
              borderColor: 'divider',
              overflowY: 'auto',
              bgcolor: '#fafafa',
            }}
          >
            <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#888',
                }}
              >
                Pages
              </Typography>
            </Box>
            {VISIBLE_NAV_ITEMS.map((item) => {
              const pageKey = item.path.replace('/app/admin/configuration/', '');
              const meta = PAGE_GROUP_META[pageKey];
              if (!meta) return null;
              const isActive = activePagePath === item.path;

              return (
                <Box
                  key={pageKey}
                  onClick={() => setActivePagePath(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 2,
                    py: 1.1,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    bgcolor: isActive ? alpha(item.accent, 0.1) : 'transparent',
                    borderLeft: isActive ? `3px solid ${item.accent}` : '3px solid transparent',
                    '&:hover': {
                      bgcolor: isActive ? alpha(item.accent, 0.1) : alpha(item.accent, 0.06),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1,
                      bgcolor: alpha(item.accent, 0.14),
                      color: item.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      flexShrink: 0,
                    }}
                  >
                    <item.Icon sx={{ fontSize: '1rem' }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      color: isActive ? item.accent : 'text.primary',
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Column 2: Sections */}
          <Box
            sx={{
              flex: 1,
              borderRight: '1px solid',
              borderColor: 'divider',
              overflowY: 'auto',
              bgcolor: '#fff',
            }}
          >
            <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#888',
                }}
              >
                Sections
              </Typography>
            </Box>
          </Box>

          {/* Column 3: Data */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              bgcolor: '#fafafa',
            }}
          >
            <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#888',
                }}
              >
                Data
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant='outlined' size='small'>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          size='small'
          disabled={!activePagePath}
          sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigPathPicker;
