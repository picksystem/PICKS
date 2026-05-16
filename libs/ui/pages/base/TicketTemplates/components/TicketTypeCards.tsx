import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  alpha,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ITicketType } from '@serviceops/interfaces';
import { getIconComponent, getTypeColor, getTypeGradient } from '../utils/ticketTypeIcons';

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
  if (ticketTypes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant='body2' color='text.disabled'>
          No ticket types match your search.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {ticketTypes.map((tt) => {
        const color = getTypeColor(tt.type);
        const gradient = getTypeGradient(tt.type);
        const iconKey = iconMap[tt.type] ?? 'report_problem';
        const prefix = tt.prefix || tt.type.slice(0, 3).toUpperCase();
        const preview = buildPreview(prefix, tt.numberLength || 7);
        const isSelected = tt.id === selectedRowId;

        return (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={tt.id}>
            <Card
              elevation={0}
              onClick={() => onSelect(tt)}
              sx={{
                border: '2px solid',
                borderColor: isSelected ? color : 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  borderColor: color,
                  boxShadow: `0 8px 28px ${alpha(color, 0.2)}`,
                  transform: 'translateY(-3px)',
                },
                ...(isSelected && {
                  borderColor: color,
                  boxShadow: `0 0 0 1px ${color}, 0 8px 28px ${alpha(color, 0.24)}`,
                }),
              }}
            >
              {/* Gradient top strip */}
              <Box sx={{ height: 5, background: gradient }} />

              <CardContent sx={{ pb: 1, flex: 1 }}>
                {/* Header: icon badge + name + status */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    {/* Icon badge — create-ticket page style */}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: gradient,
                        boxShadow: `0 6px 20px ${alpha(color, 0.38)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getIconComponent(iconKey, { color: '#fff', fontSize: '1.25rem' })}
                    </Box>
                    <Box>
                      <Typography fontWeight={700} fontSize='0.92rem' lineHeight={1.3}>
                        {tt.displayName || tt.name}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontSize='0.68rem'
                        fontFamily='monospace'
                      >
                        {tt.type}
                      </Typography>
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

                {/* Format preview — create-ticket card style */}
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 1.75,
                    px: 2,
                    background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.04)} 100%)`,
                    border: `1px solid ${alpha(color, 0.18)}`,
                    borderRadius: 1.5,
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    sx={{
                      display: 'block',
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      letterSpacing: 2,
                      color: 'text.secondary',
                      mb: 0.5,
                    }}
                  >
                    FORMAT PREVIEW
                  </Typography>
                  <Typography
                    fontFamily='monospace'
                    fontWeight={800}
                    fontSize='1.35rem'
                    sx={{ color, letterSpacing: 2.5 }}
                  >
                    {preview}
                  </Typography>
                </Box>

                {/* Prefix + Length tiles */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      py: 0.875,
                      px: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      sx={{
                        display: 'block',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: 'text.secondary',
                        mb: 0.25,
                      }}
                    >
                      PREFIX
                    </Typography>
                    <Typography
                      fontFamily='monospace'
                      fontWeight={700}
                      fontSize='0.88rem'
                      sx={{ color }}
                    >
                      {prefix}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      py: 0.875,
                      px: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      sx={{
                        display: 'block',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: 'text.secondary',
                        mb: 0.25,
                      }}
                    >
                      LENGTH
                    </Typography>
                    <Typography fontFamily='monospace' fontWeight={700} fontSize='0.88rem'>
                      {tt.numberLength || 7} digits
                    </Typography>
                  </Box>
                </Box>

                {/* Description */}
                <Typography
                  variant='body2'
                  color='text.secondary'
                  fontSize='0.78rem'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                    minHeight: '2.34em',
                    lineHeight: 1.6,
                  }}
                >
                  {tt.description || 'No description provided.'}
                </Typography>
              </CardContent>

              {/* Footer actions */}
              <CardActions
                onClick={(e) => e.stopPropagation()}
                sx={{
                  px: 2,
                  pb: 1.25,
                  pt: 0.75,
                  justifyContent: 'flex-end',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  gap: 0.5,
                }}
              >
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
