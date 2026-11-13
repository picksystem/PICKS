import { alpha } from '@mui/material';
import { useStyles } from './styles';
import { Box, Loader, Typography, Chip, Tooltip, PageHeader } from '@serviceops/component';
import useCreateTicket from './hooks/useCreateTicket';
import { useGetTicketTypeQuery } from '../../../../services';
import {
  getIconComponent,
  getTagOption,
  loadIconMap,
  loadTagMap,
  getTagVisuals,
  FALLBACK_COLOR,
} from '../Configuration/utils/ticketTypeIcons';

const CreateTicket = () => {
  const { classes } = useStyles();
  const { openTypeDetails } = useCreateTicket();

  const { data: ticketTypes, isLoading } = useGetTicketTypeQuery();
  const iconMap = loadIconMap();
  const tagMap = loadTagMap();

  // API returns records already ordered by displayOrder from DB
  const activeTypes = (ticketTypes ?? []).filter((t) => t.isActive);

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
        <PageHeader
          title='Create a New Ticket'
          description='Choose the ticket type that best describes your request'
          className={classes.pageHeader}
        />

        {/* ── Ticket type grid (click a card to open its create form) ─────── */}
        <Box className={classes.ticketTypeGrid}>
          {activeTypes.map((t) => {
            const { accent, gradient, glow } = getVisuals(t.type);
            const iconKey = iconMap[t.type];
            const displayTag = tagMap[t.type] ?? '';
            const ticketTypeName = t.name;
            const creationPageDisplayText = t.displayName;
            const creationPageDisplayTag = t.displayTag;

            return (
              <Tooltip key={t.type} title={t.description} placement='right' arrow>
                <Box
                  className={classes.ticketCard}
                  onClick={() => openTypeDetails(t.type)}
                  sx={{
                    border: '1.5px solid transparent',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    '&:hover': {
                      border: `1.5px solid ${accent}`,
                      boxShadow: `0 0 0 3px ${glow}, 0 12px 40px rgba(0,0,0,0.16)`,
                      background: `linear-gradient(160deg, ${alpha(accent, 0.06)} 0%, transparent 60%)`,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Accent bar (left border) */}
                  <Box className={classes.ticketAccentBar} sx={{ background: gradient }} />

                  {/* Icon + title row */}
                  <Box className={classes.ticketCardHeader}>
                    <Box
                      className={classes.ticketIconBadge}
                      sx={{ background: gradient, boxShadow: `0 6px 18px ${glow}` }}
                    >
                      {getIconComponent(iconKey, { fontSize: 24, color: '#fff' })}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography className={classes.ticketCardTitle}>{ticketTypeName}</Typography>
                      {displayTag && (
                        <Chip
                          label={displayTag}
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

                  {/* Creation page display text */}
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: accent,
                      mb: 0.75,
                      lineHeight: 1.3,
                    }}
                  >
                    {creationPageDisplayTag}
                  </Typography>

                  {/* Description */}
                  <Typography className={classes.ticketCardDesc}>
                    {creationPageDisplayText}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateTicket;
