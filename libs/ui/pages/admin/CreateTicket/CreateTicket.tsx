import { Typography, Chip, alpha, darken } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useStyles } from './styles';
import { Box, Button, Loader } from '@picks/component';
import useCreateTicket from './hooks/useCreateTicket';
import { useGetTicketTypeQuery } from '../../../../services';
import {
  getIconComponent,
  getTagOption,
  loadIconMap,
  loadTagMap,
} from '../Configuration/utils/ticketTypeIcons';

/** Derive card visuals from priority tag color */
function getTagVisuals(tagColor: string) {
  const accent = tagColor;
  const gradient = `linear-gradient(135deg, ${darken(tagColor, 0.2)} 0%, ${tagColor} 100%)`;
  const glow = alpha(tagColor, 0.35);
  return { accent, gradient, glow };
}

const FALLBACK_COLOR = '#64748b';

const CreateTicket = () => {
  const { classes } = useStyles();
  const { selectedType, setSelectedType, handleEnterDetails, handleCancelCreation } =
    useCreateTicket();

  const { data: ticketTypes, isLoading } = useGetTicketTypeQuery();
  const iconMap = loadIconMap();
  const tagMap = loadTagMap();

  const activeTypes = (ticketTypes ?? [])
    .filter((t) => t.isActive)
    .sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));
  const selected = activeTypes.find((t) => t.type === selectedType);

  const getVisuals = (type: string) => {
    const tag = tagMap[type] ?? '';
    const tagColor = getTagOption(tag)?.color ?? FALLBACK_COLOR;
    return getTagVisuals(tagColor);
  };

  if (isLoading) {
    return (
      <Box className={classes.selectionPage}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.selectionPage}>
      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <Box className={classes.scrollContent}>
        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <Box className={classes.heroHeader}>
          <Box className={classes.heroIconWrap}>
            <ConfirmationNumberIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Box>
            <Typography className={classes.heroTitle}>Create a New Ticket</Typography>
            <Typography className={classes.heroSubtitle}>
              Choose the ticket type that best describes your request
            </Typography>
          </Box>
        </Box>

        {/* ── Ticket type grid ─────────────────────────────────────────────── */}
        <Box className={classes.ticketTypeGrid}>
          {activeTypes.map((t) => {
            const isSelected = selectedType === t.type;
            const { accent, gradient, glow } = getVisuals(t.type);
            const iconKey = iconMap[t.type];
            const tag = tagMap[t.type] ?? '';

            return (
              <Box
                key={t.type}
                className={classes.ticketCard}
                onClick={() => setSelectedType(t.type)}
                sx={{
                  border: isSelected ? `1.5px solid ${accent}` : '1.5px solid transparent',
                  boxShadow: isSelected
                    ? `0 0 0 3px ${glow}, 0 8px 32px rgba(0,0,0,0.12)`
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isSelected
                    ? `linear-gradient(160deg, ${alpha(accent, 0.06)} 0%, transparent 60%)`
                    : undefined,
                  '&:hover': {
                    boxShadow: isSelected
                      ? `0 0 0 3px ${glow}, 0 12px 40px rgba(0,0,0,0.16)`
                      : `0 8px 32px ${alpha(accent, 0.22)}`,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Top accent bar */}
                <Box className={classes.ticketAccentBar} sx={{ background: gradient }} />

                {/* Selected checkmark */}
                {isSelected && (
                  <CheckCircleIcon
                    sx={{ position: 'absolute', top: 12, right: 12, color: accent, fontSize: 20 }}
                  />
                )}

                {/* Icon + title row */}
                <Box className={classes.ticketCardHeader}>
                  <Box
                    className={classes.ticketIconBadge}
                    sx={{ background: gradient, boxShadow: `0 6px 18px ${glow}` }}
                  >
                    {getIconComponent(iconKey, { fontSize: 24, color: '#fff' })}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className={classes.ticketCardTitle}>
                      {t.displayName || t.name}
                    </Typography>
                    {tag && (
                      <Chip
                        label={tag}
                        size='small'
                        className={classes.ticketTag}
                        sx={{
                          mt: 0.5,
                          background: alpha(accent, 0.1),
                          color: accent,
                          border: `1px solid ${alpha(accent, 0.25)}`,
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Description */}
                <Typography className={classes.ticketCardDesc}>{t.description || '—'}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
      {/* end scrollContent */}

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <Box className={classes.ctaBar}>
        <Box className={classes.ctaLeft}>
          {selected && (
            <Typography className={classes.ctaSelected}>
              <b>Selected:</b>{' '}
              <span style={{ color: getVisuals(selected.type).accent, fontWeight: 700 }}>
                {selected.displayName || selected.name}
              </span>
            </Typography>
          )}
        </Box>
        <Box className={classes.ctaButtons}>
          <Button variant='outlined' color='error' onClick={handleCancelCreation}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleEnterDetails}
            disabled={!selectedType}
            sx={{
              ...(selected && {
                background: getVisuals(selected.type).gradient,
                boxShadow: `0 4px 16px ${getVisuals(selected.type).glow}`,
                '&:hover': {
                  background: getVisuals(selected.type).gradient,
                  filter: 'brightness(1.1)',
                },
              }),
              minWidth: 160,
              fontWeight: 700,
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateTicket;
