import { Box, Tabs, Tab } from '../../../../components';
import { Typography, IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import { IIncident, IIncidentComment, IResolution, IActivityLog } from '@picks/interfaces';
import { useNotification } from '@picks/hooks';
import { useStyles } from '../styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  classes: Record<string, string>;
}

const TabPanel = ({ children, value, index, classes }: TabPanelProps) => (
  <div role='tabpanel' hidden={value !== index}>
    {value === index && <Box className={classes.tabPanel}>{children}</Box>}
  </div>
);

interface TabsSectionProps {
  activeTab: number;
  onTabChange: (value: number) => void;
  incident: IIncident;
  comments?: IIncidentComment[];
  resolutions?: IResolution[];
  activities?: IActivityLog[];
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return { icon: <PictureAsPdfIcon sx={{ fontSize: 22 }} />, color: '#dc2626', bg: '#fef2f2' };
  if (['doc', 'docx'].includes(ext)) return { icon: <DescriptionIcon sx={{ fontSize: 22 }} />, color: '#1d4ed8', bg: '#eff6ff' };
  if (['xls', 'xlsx'].includes(ext)) return { icon: <TableChartIcon sx={{ fontSize: 22 }} />, color: '#15803d', bg: '#f0fdf4' };
  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return { icon: <ImageIcon sx={{ fontSize: 22 }} />, color: '#7c3aed', bg: '#f5f3ff' };
  return { icon: <InsertDriveFileIcon sx={{ fontSize: 22 }} />, color: '#64748b', bg: '#f8faff' };
};

const tabsSx = {
  minHeight: 44,
  background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
  borderBottom: '1px solid rgba(226, 232, 255, 0.9)',
  '& .MuiTab-root': {
    minHeight: 44,
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '8px 18px',
    color: '#64748b',
    transition: 'color 0.2s ease',
    '&.Mui-selected': { color: '#4338ca' },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(90deg, #4338ca, #6366f1)',
  },
};

const TabsSection = ({
  activeTab,
  onTabChange,
  incident,
  comments,
  resolutions,
  activities,
}: TabsSectionProps) => {
  const { classes, cx } = useStyles();
  const notify = useNotification();

  const handleDownload = async (filename: string, fileUrl: string) => {
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) {
        notify.error(`File "${filename}" is not available on the server.`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      notify.error(`Failed to download "${filename}". Please try again.`);
    }
  };

  return (
    <Box className={classes.tabsSectionCard}>
      <Tabs
        value={activeTab}
        onChange={(_e, newValue) => onTabChange(newValue)}
        variant='scrollable'
        scrollButtons='auto'
        sx={tabsSx}
      >
        <Tab label='Updates' />
        <Tab label='Attachments' />
        <Tab label='Resolution' />
        <Tab label='Activity' />
      </Tabs>

      <Box className={classes.tabsPanelContent}>
        {/* Updates Tab */}
        <TabPanel value={activeTab} index={0} classes={classes}>
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <Box
                key={comment.id}
                className={cx(
                  classes.tabsUpdateCard,
                  comment.isInternal
                    ? classes.tabsUpdateCardInternal
                    : classes.tabsUpdateCardExternal,
                )}
              >
                <Box className={classes.tabsUpdateCardHeader}>
                  <Typography className={classes.tabsUpdateCardSubject}>
                    {comment.subject}
                  </Typography>
                  <Typography className={classes.tabsUpdateCardTime}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Typography className={classes.tabsUpdateCardMessage}>{comment.message}</Typography>
                <Typography className={classes.tabsUpdateCardBy}>
                  By: {comment.createdBy} {comment.isInternal ? '· Internal' : ''}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography className={classes.tabsEmptyText}>No updates available</Typography>
          )}
        </TabPanel>

        {/* Attachments Tab */}
        <TabPanel value={activeTab} index={1} classes={classes}>
          {incident.attachments ? (
            (() => {
              try {
                const attachments = JSON.parse(incident.attachments);
                if (Array.isArray(attachments) && attachments.length > 0) {
                  return attachments.map((att: string, idx: number) => {
                    // Strip the leading timestamp prefix (e.g. "1740876543210-") for display only.
                    // The full server filename (att) is still used for the download URL.
                    const displayName = att.replace(/^\d{10,}-/, '');
                    const { icon, color, bg } = getFileIcon(displayName);
                    const ext = displayName.split('.').pop()?.toUpperCase() ?? 'FILE';
                    return (
                      <Box
                        key={idx}
                        className={classes.tabsAttachmentItem}
                        sx={{ justifyContent: 'space-between' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: '10px',
                              background: bg,
                              border: `1px solid ${color}30`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color,
                            }}
                          >
                            {icon}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              className={classes.tabsAttachmentText}
                              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {displayName}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {ext}
                            </Typography>
                          </Box>
                        </Box>
                        <Tooltip title={`Download ${displayName}`}>
                          <span>
                            <IconButton
                              size='small'
                              onClick={() =>
                                handleDownload(
                                  displayName,
                                  `http://localhost:3001/uploads/attachments/${encodeURIComponent(att)}`,
                                )
                              }
                              sx={{
                                color,
                                background: bg,
                                border: `1px solid ${color}30`,
                                borderRadius: '8px',
                                width: 32,
                                height: 32,
                                flexShrink: 0,
                                '&:hover': { background: `${color}15` },
                              }}
                            >
                              <DownloadIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    );
                  });
                }
                return <Typography className={classes.tabsEmptyText}>No attachments</Typography>;
              } catch {
                return <Typography className={classes.tabsEmptyText}>No attachments</Typography>;
              }
            })()
          ) : (
            <Typography className={classes.tabsEmptyText}>No attachments</Typography>
          )}
        </TabPanel>

        {/* Resolution Tab */}
        <TabPanel value={activeTab} index={2} classes={classes}>
          {resolutions && resolutions.length > 0 ? (
            resolutions.map((res) => (
              <Box key={res.id} className={classes.tabsResolutionCard}>
                <Box className={classes.tabsResolutionMeta}>
                  <Typography className={classes.tabsResolutionMetaLabel}>
                    Code: {res.resolutionCode.replace(/_/g, ' ')}
                  </Typography>
                  {res.category && (
                    <Typography className={classes.tabsResolutionMetaLabel}>
                      Category: {res.category}
                    </Typography>
                  )}
                </Box>
                <Typography className={classes.tabsResolutionText}>{res.resolution}</Typography>
                {res.rootCause && (
                  <Typography className={classes.tabsResolutionRootCause}>
                    Root Cause: {res.rootCause}
                  </Typography>
                )}
                <Typography className={classes.tabsResolutionBy}>
                  By: {res.createdBy} · {new Date(res.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography className={classes.tabsResolutionNotesText}>
              {incident.notes || <span style={{ color: '#94a3b8' }}>No resolution notes</span>}
            </Typography>
          )}
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={activeTab} index={3} classes={classes}>
          {activities && activities.length > 0 ? (
            <Box className={classes.tabsActivityList}>
              {activities.map((activity) => (
                <Box key={activity.id} className={classes.tabsActivityItem}>
                  <Box className={classes.tabsActivityDot} />
                  <Box className={classes.tabsActivityContent}>
                    <Typography className={classes.tabsActivityDescription}>
                      {activity.description}
                    </Typography>
                    <Box className={classes.tabsActivityMeta}>
                      <Typography className={classes.tabsActivityMetaText}>
                        {new Date(activity.createdAt).toLocaleString()}
                      </Typography>
                      <Typography className={classes.tabsActivityMetaText}>
                        By: {activity.performedBy}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography className={classes.tabsEmptyText}>No activity records</Typography>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TabsSection;
