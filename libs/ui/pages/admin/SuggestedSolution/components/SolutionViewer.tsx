import {
  Typography,
  LinearProgress,
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { Box } from '@picks/component';
import { IncidentStatus, IIncident } from '../../../../../entities/interfaces';
import { useStyles } from '../styles';

interface SolutionMatch {
  incident: IIncident;
  similarity: number;
}

interface SolutionViewerProps {
  isLoading: boolean;
  current: SolutionMatch | null;
  safeIndex: number;
  total: number;
  shortDesc: string;
  issueText: string;
  markedUseful: Set<number>;
  onPrev: () => void;
  onNext: () => void;
  onToggleUseful: (id: number) => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case IncidentStatus.RESOLVED:
      return {
        bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
        color: '#15803d',
        border: '#86efac',
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
        label: 'Resolved',
      };
    case IncidentStatus.CLOSED:
      return {
        bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
        color: '#475569',
        border: '#cbd5e1',
        icon: <LockOutlinedIcon sx={{ fontSize: 13 }} />,
        label: 'Closed',
      };
    case IncidentStatus.IN_PROGRESS:
      return {
        bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        color: '#1d4ed8',
        border: '#93c5fd',
        icon: <SpeedIcon sx={{ fontSize: 13 }} />,
        label: 'In Progress',
      };
    default:
      return {
        bg: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
        color: '#4338ca',
        border: '#a5b4fc',
        icon: <SpeedIcon sx={{ fontSize: 13 }} />,
        label: status.replace(/_/g, ' '),
      };
  }
};

const getPriorityStyle = (priority: string) => {
  if (priority?.includes('1') || priority?.toLowerCase().includes('critical'))
    return { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' };
  if (priority?.includes('2') || priority?.toLowerCase().includes('high'))
    return { color: '#ea580c', bg: '#fff7ed', border: '#fdba74' };
  if (priority?.includes('3') || priority?.toLowerCase().includes('medium'))
    return { color: '#ca8a04', bg: '#fefce8', border: '#fde047' };
  return { color: '#16a34a', bg: '#f0fdf4', border: '#86efac' };
};

const getMatchColor = (similarity: number) =>
  similarity >= 75
    ? { color: '#15803d', bg: '#dcfce7', border: '#86efac' }
    : similarity >= 40
      ? { color: '#b45309', bg: '#fef3c7', border: '#fcd34d' }
      : { color: '#4338ca', bg: '#eef2ff', border: '#a5b4fc' };

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

const SolutionViewer = ({
  isLoading,
  current,
  safeIndex,
  total,
  shortDesc,
  issueText,
  markedUseful,
  onPrev,
  onNext,
  onToggleUseful,
}: SolutionViewerProps) => {
  const { classes, cx } = useStyles();
  const prevActive = total > 0 && safeIndex > 0;
  const nextActive = total > 0 && safeIndex < total - 1;

  return (
    <Box className={classes.solutionsPanel}>
      {/* Nav header */}
      <Box className={classes.navHeader}>
        <IconButton
          size='small'
          onClick={onPrev}
          disabled={!prevActive}
          className={cx(prevActive ? classes.navArrowActive : classes.navArrowDisabled)}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
        </IconButton>

        <Box className={classes.navTitleBox}>
          {current ? (
            <Typography className={classes.navTitleText}>{current.incident.number}</Typography>
          ) : (
            <Typography className={classes.navTitleEmpty}>
              {isLoading
                ? 'Scanning...'
                : total === 0 && (shortDesc || issueText)
                  ? 'No matches'
                  : 'No results yet'}
            </Typography>
          )}
        </Box>

        <IconButton
          size='small'
          onClick={onNext}
          disabled={!nextActive}
          className={cx(nextActive ? classes.navArrowActive : classes.navArrowDisabled)}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box className={classes.solutionsPanelBody}>
        {isLoading ? (
          <Box className={classes.loadingBox}>
            <LinearProgress className={classes.loadingBar} />
            <EmojiObjectsOutlinedIcon sx={{ fontSize: 44, color: '#c7d2fe' }} />
            <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
              Scanning resolved incidents...
            </Typography>
          </Box>
        ) : !current ? (
          <Box className={classes.emptyState}>
            <Box className={classes.emptyIconBox}>
              <EmojiObjectsOutlinedIcon sx={{ fontSize: 34, color: '#a5b4fc' }} />
            </Box>
            <Typography className={classes.emptyTitle}>
              {!shortDesc && !issueText ? 'Start Typing to Find Solutions' : 'No Matches Found'}
            </Typography>
            <Typography className={classes.emptySubtitle}>
              {!shortDesc && !issueText
                ? 'Enter a description on the left to search through resolved incidents and surface the best matching solutions.'
                : 'No resolved incidents matched your description. You can still submit this as a new incident and the team will resolve it.'}
            </Typography>
          </Box>
        ) : (
          <MatchDetail
            incident={current.incident}
            similarity={current.similarity}
            markedUseful={markedUseful}
            onToggleUseful={onToggleUseful}
          />
        )}
      </Box>
    </Box>
  );
};

interface MatchDetailProps {
  incident: IIncident;
  similarity: number;
  markedUseful: Set<number>;
  onToggleUseful: (id: number) => void;
}

const MatchDetail = ({ incident, similarity, markedUseful, onToggleUseful }: MatchDetailProps) => {
  const { classes, cx } = useStyles();
  const matchStyle = getMatchColor(similarity);
  const statusStyle = getStatusStyle(incident.status);
  const priorityStyle = getPriorityStyle(incident.priority ?? '');
  const isUseful = markedUseful.has(incident.id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Score + Status banner */}
      <Box
        className={classes.scoreBanner}
        sx={{
          background: `linear-gradient(135deg, ${matchStyle.bg}, #fff)`,
          border: `1.5px solid ${matchStyle.border}`,
          boxShadow: `0 3px 16px ${matchStyle.color}18`,
        }}
      >
        {/* Score circle — conic-gradient depends on similarity so stays inline */}
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            flexShrink: 0,
            background: `conic-gradient(${matchStyle.color} ${similarity * 3.6}deg, #e2e8f0 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${matchStyle.border}`,
          }}
        >
          <Box className={classes.scoreCircleInner}>
            <Typography className={classes.scorePercent} sx={{ color: matchStyle.color }}>
              {similarity}%
            </Typography>
            <Typography className={classes.scoreMatchLabel}>MATCH</Typography>
          </Box>
        </Box>

        <Box className={classes.scoreDetailsBox}>
          <Box className={classes.scoreChipRow}>
            <Box
              className={classes.statusChip}
              sx={{
                background: statusStyle.bg,
                border: `1px solid ${statusStyle.border}`,
                color: statusStyle.color,
              }}
            >
              {statusStyle.icon}
              {statusStyle.label}
            </Box>
            {incident.priority && (
              <Box
                className={classes.statusChip}
                sx={{
                  background: priorityStyle.bg,
                  border: `1px solid ${priorityStyle.border}`,
                  color: priorityStyle.color,
                }}
              >
                <PriorityHighIcon sx={{ fontSize: 12 }} />
                {incident.priority}
              </Box>
            )}
          </Box>
          <Typography className={classes.scoreCreatedDate}>
            Created{' '}
            {new Date(incident.createdAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>

      {/* Short Description */}
      <Box className={classes.shortDescSection}>
        <Typography className={classes.shortDescLabel}>Short Description</Typography>
        <Typography className={classes.shortDescValue}>
          {incident.shortDescription || '—'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 1.5, borderColor: 'rgba(226,232,255,0.9)' }} />

      {/* Description */}
      {incident.description && (
        <Box className={classes.descCard}>
          <Box className={classes.descCardHeader}>
            <DescriptionOutlinedIcon sx={{ fontSize: 14, color: '#6366f1' }} />
            <Typography className={classes.descCardLabel}>Description</Typography>
          </Box>
          <Typography className={classes.descCardText}>
            {stripHtml(incident.description)}
          </Typography>
        </Box>
      )}

      {/* Resolution / Notes */}
      {incident.notes && (
        <Box className={classes.resCard}>
          <Box className={classes.resCardHeader}>
            <AssignmentTurnedInIcon sx={{ fontSize: 14, color: '#16a34a' }} />
            <Typography className={classes.resCardLabel}>Resolution / Notes</Typography>
          </Box>
          <Typography className={classes.resCardText}>{incident.notes}</Typography>
        </Box>
      )}

      {/* Mark as useful */}
      <Divider sx={{ mb: 1.5, borderColor: 'rgba(226,232,255,0.9)' }} />
      <Box className={cx(classes.markUsefulRow, isUseful && classes.markUsefulRowChecked)}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isUseful}
              onChange={() => onToggleUseful(incident.id)}
              size='small'
              sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#16a34a' } }}
            />
          }
          label={
            <Typography
              className={cx(classes.markUsefulLabel, isUseful && classes.markUsefulLabelChecked)}
            >
              Mark as useful
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Box>
    </Box>
  );
};

export default SolutionViewer;
