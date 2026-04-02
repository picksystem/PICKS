import {
  Typography,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  alpha,
  Grid,
  Box,
  darken,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ITicketType } from '@serviceops/interfaces';
import { getIconComponent, loadTagMap, getTagOption } from '../utils/ticketTypeIcons';
import { useStyles } from '../styles';

const FALLBACK_COLOR = '#64748b';

function buildPreview(prefix: string, length: number): string {
  const num = '1'.padStart(Math.max(1, length), '0');
  return `${prefix.toUpperCase()}${num}`;
}

interface TicketTypeCardsProps {
  ticketTypes: ITicketType[];
  selectedRowId?: number;
  iconMap: Record<string, string>;
  onSelect: (row: ITicketType) => void;
  onEdit: (row: ITicketType) => void;
  onDelete: (row: ITicketType) => void;
}

const TicketTypeCards = ({
  ticketTypes,
  selectedRowId,
  iconMap,
  onSelect,
  onEdit,
  onDelete,
}: TicketTypeCardsProps) => {
  const { classes } = useStyles();
  const tagMap = loadTagMap();

  if (ticketTypes.length === 0) {
    return (
      <Box className={classes.sectionEmptyBox}>
        <Typography variant='body2' color='text.disabled'>
          No ticket types match your search.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} className={classes.cardGrid}>
      {ticketTypes.map((tt) => {
        const tag = tagMap[tt.type] ?? '';
        const color = getTagOption(tag)?.color ?? FALLBACK_COLOR;
        const gradient = `linear-gradient(135deg, ${darken(color, 0.2)} 0%, ${color} 100%)`;
        const iconKey = iconMap[tt.type] ?? 'report_problem';
        const prefix = tt.prefix || tt.type.slice(0, 3).toUpperCase();
        const preview = buildPreview(prefix, tt.numberLength || 7);
        const isSelected = tt.id === selectedRowId;

        return (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={tt.id}>
            <Card
              elevation={0}
              onClick={() => onSelect(tt)}
              className={classes.card}
              sx={{
                borderColor: isSelected ? color : undefined,
                boxShadow: isSelected
                  ? `0 0 0 1px ${color}, 0 8px 28px ${alpha(color, 0.24)}`
                  : undefined,
                '&:hover': {
                  borderColor: color,
                  boxShadow: `0 8px 28px ${alpha(color, 0.2)}`,
                  transform: 'translateY(-3px)',
                },
              }}
            >
              {/* Gradient top strip */}
              <Box className={classes.cardAccentStrip} sx={{ background: gradient }} />

              <CardContent className={classes.cardContent}>
                {/* Header: icon badge + name + status */}
                <Box className={classes.cardHeader}>
                  <Box className={classes.cardHeaderLeft}>
                    <Box
                      className={classes.cardIconBadge}
                      sx={{
                        background: gradient,
                        boxShadow: `0 6px 20px ${alpha(color, 0.38)}`,
                      }}
                    >
                      {getIconComponent(iconKey, { color: '#fff', fontSize: '1.25rem' })}
                    </Box>
                    <Box>
                      <Typography className={classes.cardTypeLabel}>
                        {tt.displayName || tt.name}
                      </Typography>
                      <Typography className={classes.cardTypeKey}>{tt.type}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={tt.isActive ? 'Active' : 'Inactive'}
                    size='small'
                    color={tt.isActive ? 'success' : 'default'}
                    variant={tt.isActive ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.68rem', height: 20, flexShrink: 0, ml: 0.5 }}
                  />
                </Box>

                {/* Format preview */}
                <Box
                  className={classes.cardFormatPreviewBox}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.04)} 100%)`,
                    border: `1px solid ${alpha(color, 0.18)}`,
                  }}
                >
                  <Typography className={classes.cardFormatLabel}>FORMAT PREVIEW</Typography>
                  <Typography className={classes.cardFormatValue} sx={{ color }}>
                    {preview}
                  </Typography>
                </Box>

                {/* Prefix + Length tiles */}
                <Box className={classes.cardTiles}>
                  <Box className={classes.cardTile}>
                    <Typography className={classes.cardTileLabel}>PREFIX</Typography>
                    <Typography className={classes.cardTileValue} sx={{ color }}>
                      {prefix}
                    </Typography>
                  </Box>
                  <Box className={classes.cardTile}>
                    <Typography className={classes.cardTileLabel}>LENGTH</Typography>
                    <Typography className={classes.cardTileValue}>
                      {tt.numberLength || 7} digits
                    </Typography>
                  </Box>
                </Box>

                {/* Description */}
                <Typography className={classes.cardDescription}>
                  {tt.description || 'No description provided.'}
                </Typography>
              </CardContent>

              {/* Footer actions */}
              <CardActions onClick={(e) => e.stopPropagation()} className={classes.cardActions}>
                <Tooltip title='Edit' placement='top'>
                  <IconButton
                    size='small'
                    onClick={() => onEdit(tt)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha('#2563eb', 0.08) },
                    }}
                  >
                    <EditIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Delete' placement='top'>
                  <IconButton
                    size='small'
                    onClick={() => onDelete(tt)}
                    sx={{
                      color: 'error.main',
                      '&:hover': { bgcolor: alpha('#ef4444', 0.08) },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TicketTypeCards;
