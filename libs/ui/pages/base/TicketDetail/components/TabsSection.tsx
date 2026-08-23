import { Box, Tabs, Tab } from '../../../../components';
import AttachmentsSection from './AttachmentsSection';
import ResolutionSection from './ResolutionSection';
import { IIncidentComment, IResolution } from '@serviceops/interfaces';
import { useStyles } from '../styles';
import UpdatesSection from './UpdatesSection';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';

interface TabsSectionProps {
  activeTab: number;
  onTabChange: (value: number) => void;
  incident: TicketEntity;
  comments?: IIncidentComment[];
  resolutions?: IResolution[];
  onRefresh?: () => void;
  onRefreshComments?: () => void;
  onUpdateTicket?: UpdateTicketFn;
  onAddResolution?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  classes: Record<string, string>;
}

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

const TabPanel = ({ children, value, index, classes }: TabPanelProps) => (
  <div role='tabpanel' hidden={value !== index}>
    {value === index && <Box className={classes.tabPanel}>{children}</Box>}
  </div>
);

const TabsSection = ({
  activeTab,
  onTabChange,
  incident,
  comments,
  resolutions,
  onRefresh,
  onRefreshComments,
  onUpdateTicket,
  onAddResolution,
}: TabsSectionProps) => {
  const { classes } = useStyles();

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
      </Tabs>

      <Box className={classes.tabsPanelContent}>
        {/* Updates Tab */}
        <TabPanel value={activeTab} index={0} classes={classes}>
          <UpdatesSection
            comments={(comments as any) ?? []}
            incidentId={incident.id}
            ticketType={incident.ticketType}
            incident={incident}
            onRefresh={onRefresh ?? (() => {})}
            onRefreshComments={onRefreshComments ?? (() => {})}
          />
        </TabPanel>

        {/* Attachments Tab */}
        <TabPanel value={activeTab} index={1} classes={classes}>
          <AttachmentsSection
            incident={incident}
            onUpdateTicket={onUpdateTicket ?? (() => ({ unwrap: async () => {} }))}
            onRefresh={onRefresh ?? (() => {})}
          />
        </TabPanel>

        {/* Resolution Tab */}
        <TabPanel value={activeTab} index={2} classes={classes}>
          <ResolutionSection resolutions={resolutions ?? []} onAddResolution={onAddResolution} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TabsSection;
