import {
  Box,
  Tooltip,
  IconButton,
  ContentCopyIcon,
  LinkIcon,
  NavigateBeforeIcon,
  NavigateNextIcon,
} from '../../../../components';
import { Typography } from '@mui/material';
import { IIncident } from '@serviceops/interfaces';
import { copyRichLink, copyToClipboard } from '../utils/incidentDetail.utils';

interface IncidentHeaderProps {
  classes: Record<string, string>;
  incident: IIncident;
  prevNumber: string | null;
  nextNumber: string | null;
  navigateToIncident: (num: string) => void;
}

const navIconSize = '1.4rem';

const navIconSx = { fontSize: navIconSize };
const navIconInheritSx = { fontSize: navIconSize, color: 'inherit' };
const copyIconSx = { fontSize: '1rem' };
const copyIconWhiteSx = { fontSize: '0.875rem', color: '#fff' };
const linkIconSx = { fontSize: '1.3rem', color: '#666' };
const linkIconHeaderSx = { fontSize: '1.2rem' };

const NavButton = ({
  direction,
  targetNumber,
  navigateToIncident,
  className,
  classes,
}: {
  direction: 'prev' | 'next';
  targetNumber: string | null;
  navigateToIncident: (num: string) => void;
  className?: string;
  classes: Record<string, string>;
}) => {
  const Icon = direction === 'prev' ? NavigateBeforeIcon : NavigateNextIcon;
  const label = direction === 'prev' ? 'Previous incident' : 'Next incident';

  if (!targetNumber) {
    return (
      <Box className={`${className ?? ''} ${classes.navButtonDisabled}`}>
        <Icon sx={navIconInheritSx} />
      </Box>
    );
  }

  return (
    <Tooltip title={label}>
      <IconButton
        size='small'
        className={className}
        onClick={() => navigateToIncident(targetNumber)}
      >
        <Icon sx={navIconSx} />
      </IconButton>
    </Tooltip>
  );
};

const IncidentHeader = ({
  classes,
  incident,
  prevNumber,
  nextNumber,
  navigateToIncident,
}: IncidentHeaderProps) => (
  <>
    {/* Mobile-only header: Row 1 — Nav + Incident Number + Status + Copy Number */}
    <Box className={classes.mobileHeaderBar}>
      <NavButton
        direction='prev'
        targetNumber={prevNumber}
        navigateToIncident={navigateToIncident}
        classes={classes}
      />
      <Box className={classes.mobileHeaderCenter}>
        <Typography className={classes.mobileIncidentNumber}>{incident.number}</Typography>
        <Tooltip title='Copy incident number'>
          <IconButton
            size='small'
            className={classes.headerSmallIconButton}
            onClick={() =>
              copyRichLink(
                window.location.href,
                `${incident.number}: ${incident.shortDescription || '-'}`,
              )
            }
          >
            <ContentCopyIcon sx={copyIconWhiteSx} />
          </IconButton>
        </Tooltip>
      </Box>
      <NavButton
        direction='next'
        targetNumber={nextNumber}
        navigateToIncident={navigateToIncident}
        classes={classes}
      />
    </Box>

    {/* Mobile-only header: Row 2 — Title + Link icon */}
    <Box className={classes.mobileTitleBar}>
      <Typography className={classes.mobileTitleText}>
        {incident.shortDescription || '-'}
      </Typography>
      <Tooltip title='Copy Incident Number'>
        <IconButton
          size='small'
          className={classes.headerIcon}
          onClick={() => copyToClipboard(incident.number)}
        >
          <ContentCopyIcon sx={copyIconSx} />
        </IconButton>
      </Tooltip>
      <Tooltip title='Copy page URL'>
        <IconButton
          size='small'
          className={classes.headerIcon}
          onClick={() => copyToClipboard(window.location.href)}
        >
          <LinkIcon sx={linkIconSx} />
        </IconButton>
      </Tooltip>
    </Box>

    {/* Desktop header */}
    <Box className={classes.headerRow}>
      <NavButton
        direction='prev'
        targetNumber={prevNumber}
        navigateToIncident={navigateToIncident}
        className={classes.headerNavButton}
        classes={classes}
      />
      <Box className={classes.headerCenter}>
        <Typography className={classes.headerIncidentNumber} variant='subtitle1'>
          {incident.number}
        </Typography>
        <Tooltip title='Copy Incident Number'>
          <IconButton
            size='small'
            className={classes.headerIcon}
            onClick={() => copyToClipboard(incident.number)}
          >
            <ContentCopyIcon sx={copyIconSx} />
          </IconButton>
        </Tooltip>
        <Typography className={classes.headerPipeSeparator}>|</Typography>
        <Typography className={classes.headerTitle}>{incident.shortDescription || '-'}</Typography>
        <Tooltip title='Copy Incident Number & Title'>
          <IconButton
            size='small'
            className={classes.headerIcon}
            onClick={() =>
              copyRichLink(
                window.location.href,
                `${incident.number}: ${incident.shortDescription || '-'}`,
              )
            }
          >
            <ContentCopyIcon sx={copyIconSx} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Copy Page URL'>
          <IconButton
            size='small'
            className={classes.headerIcon}
            onClick={() => copyToClipboard(window.location.href)}
          >
            <LinkIcon sx={linkIconHeaderSx} />
          </IconButton>
        </Tooltip>
      </Box>
      <NavButton
        direction='next'
        targetNumber={nextNumber}
        navigateToIncident={navigateToIncident}
        className={classes.headerNavButton}
        classes={classes}
      />
    </Box>
  </>
);

export default IncidentHeader;
