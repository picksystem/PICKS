import { useState } from 'react';
import { Box, Loader, Typography } from '../../../components';
import { useStyles } from './styles';
import { useTicketDetail } from './hooks/useTicketDetail';
import {
  useGetTicketCommentsQuery,
  useGetTicketResolutionsQuery,
  useGetTicketActivitiesQuery,
} from '../../../../services';
import { TicketUpdateInput } from './types/ticketDetail.types';
import TicketHeader from './components/TicketHeader';
import DraftExpiryBanner from './components/DraftExpiryBanner';
import MobileToggleRow from './components/MobileToggleRow';
import InfoRow from './components/InfoRow';
import ActionBar from './components/ActionBar';
import WorkTimer from './components/WorkTimer';
import TimeSummary from './components/TimeSummary';
import Sidebar from './components/Sidebar';
import DescriptionSection from './components/DescriptionSection';
import TabsSection from './components/TabsSection';
import PriorityChangeModal from './modals/PriorityChangeModal';
import AssignModal from './modals/AssignModal';
import AttachmentModal from './modals/AttachmentModal';
import MoreToolsMenu from './modals/MoreToolsMenu';
import CommentWindow from './windows/CommentWindow';
import TimeEntryWindow from './windows/TimeEntryWindow';
import ResolveWindow from './windows/ResolveWindow';

const TicketDetailView = () => {
  const { classes, cx } = useStyles();
  const [infoRowOpen, setInfoRowOpen] = useState(false);
  const detail = useTicketDetail();

  const {
    number,
    incident,
    ticketType,
    isLoading,
    error,
    refetch,
    isMobile,
    layoutConfig,
    user,
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    moreToolsAnchorEl,
    isEditing,
    editFormData,
    setEditFormData,
    activeModal,
    setActiveModal,
    draftRemaining,
    draftExpired,
    updateTicket,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEdit,
    handleSaveAndClose,
    handleAccept,
    handleFollow,
    handleReviewLater,
    handleCancelIncident,
    handleGoToActivity,
    handleMoreToolsOpen,
    handleMoreToolsClose,
    showNotification,
    eta,
    handleEtaChange,
    timeSummary,
    timer,
    navigation,
    clientOptions,
    assignmentGroupOptions,
    secondaryResourceOptions,
    serviceLineOptions,
    applicationOptions,
    applicationCategoryOptions,
    applicationSubCategoryOptions,
    ticketSourceOptions,
    businessCategoryOptions,
  } = detail;

  const { data: comments } = useGetTicketCommentsQuery(
    { ticketType, ticketId: incident?.id ?? 0 },
    { skip: !incident },
  );
  const { data: resolutions } = useGetTicketResolutionsQuery(
    { ticketType, ticketId: incident?.id ?? 0 },
    { skip: !incident },
  );
  const { data: activities } = useGetTicketActivitiesQuery(
    { ticketType, ticketId: incident?.id ?? 0 },
    { skip: !incident },
  );

  const handleEditFormChange = (data: Partial<TicketUpdateInput>) => {
    setEditFormData((prev: TicketUpdateInput) => ({ ...prev, ...data }));
  };

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

  if (error || !incident) {
    return (
      <Box className={classes.container}>
        <Typography color='error' variant='body2'>
          {error ? 'Failed to load ticket details' : `Ticket "${number}" not found`}
        </Typography>
      </Box>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleDuplicate = () => {};

  const actionBarProps = {
    classes,
    isEditing,
    onEdit: handleStartEditing,
    onAccept: handleAccept,
    onAssign: () => setActiveModal('assign'),
    onComment: () => setActiveModal('comment'),
    onResolve: () => setActiveModal('resolve'),
    onTimeEntry: () => setActiveModal('timeEntry'),
    onFollow: handleFollow,
    onAttachment: () => setActiveModal('attachment'),
    onActivity: handleGoToActivity,
    onReviewLater: handleReviewLater,
    onMoreTools: handleMoreToolsOpen,
    onSave: handleSaveEdit,
    onSaveAndClose: handleSaveAndClose,
    onCancelEdit: handleCancelEditing,
    onPriorityChange: () => setActiveModal('priorityChange'),
  };

  const workTimerProps = {
    classes,
    timerSeconds: timer.timerSeconds,
    timerRunning: timer.timerRunning,
    timerStopped: timer.timerStopped,
    onStart: timer.handleTimerStart,
    onPause: timer.handleTimerPause,
    onStop: timer.handleTimerStop,
    onCancel: timer.handleTimerCancel,
  };

  return (
    <Box className={classes.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <TicketHeader
        classes={classes}
        incident={incident}
        prevNumber={navigation.prevNumber}
        nextNumber={navigation.nextNumber}
        navigateToIncident={navigation.navigateToIncident}
      />

      {/* ── Draft Expiry Banners ────────────────────────────────────────────── */}
      {incident.status === 'draft' && incident.draftExpiresAt && (
        <>
          <DraftExpiryBanner
            classes={classes}
            cx={cx}
            draftExpired={draftExpired}
            draftRemaining={draftRemaining}
            isMobile
          />
          <DraftExpiryBanner
            classes={classes}
            cx={cx}
            draftExpired={draftExpired}
            draftRemaining={draftRemaining}
          />
        </>
      )}

      {/* ── Mobile: Ticket Info toggle + InfoRow ────────────────────────────── */}
      {isMobile && (
        <MobileToggleRow
          classes={classes}
          cx={cx}
          open={infoRowOpen}
          label='Ticket Info'
          onClick={() => setInfoRowOpen((prev) => !prev)}
        />
      )}
      {(!isMobile || infoRowOpen) && (
        <InfoRow
          classes={classes}
          incident={incident}
          eta={eta}
          onEtaChange={handleEtaChange}
          onPriorityClick={() => setActiveModal('priorityChange')}
          layoutConfig={layoutConfig}
        />
      )}

      {/* ── Mobile: ActionBar ───────────────────────────────────────────────── */}
      {isMobile && <ActionBar {...actionBarProps} />}

      {/* ── Mobile: Details (Sidebar) toggle ───────────────────────────────── */}
      {isMobile && (
        <MobileToggleRow
          classes={classes}
          cx={cx}
          open={sidebarOpen}
          label='Details'
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* ── Main Layout ─────────────────────────────────────────────────────── */}
      <Box className={classes.mainLayout}>
        {/* Sidebar */}
        <Sidebar
          classes={classes}
          cx={cx}
          incident={incident}
          layoutConfig={layoutConfig}
          user={user}
          sidebarOpen={sidebarOpen}
          isEditing={isEditing}
          editFormData={editFormData}
          onEditFormChange={handleEditFormChange}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          timeSummary={timeSummary}
          clientOptions={clientOptions}
          assignmentGroupOptions={assignmentGroupOptions}
          secondaryResourceOptions={secondaryResourceOptions}
          serviceLineOptions={serviceLineOptions}
          applicationOptions={applicationOptions}
          applicationCategoryOptions={applicationCategoryOptions}
          applicationSubCategoryOptions={applicationSubCategoryOptions}
          ticketSourceOptions={ticketSourceOptions}
          businessCategoryOptions={businessCategoryOptions}
        />

        {/* Right Content Area */}
        <Box className={classes.contentArea}>
          {/* ActionBar — desktop only (mobile renders above mainLayout) */}
          {!isMobile && <ActionBar {...actionBarProps} />}

          {/* Support Note + Time Summary + Timer — all screen sizes */}
          <Box className={classes.noteAndTimerRow}>
            <Box className={classes.supportPlanNote}>
              <strong>D365 F&O &quot;Flexi&quot; Support Plan</strong>
              <ul>
                <li>ALL Support/Consulting is Billable against BLOCK contract (not recurring).</li>
                <li>
                  Time billed @ 15min increment. No pre-approval required. Time Entry billed to
                  Flexi-prepaid block.
                </li>
                <li>
                  Nominated Key Users authorised to log support tickets: <b>Elena Prihodko</b> &amp;{' '}
                  <b>Stephen Hunt</b>.
                </li>
                <li>
                  ALL Support requested MUST come directly from Key Users only — Cc Not acceptable.
                </li>
              </ul>
            </Box>
            <Box className={classes.timerAndSummaryRow}>
              <Box className={classes.timeSummaryHeaderRow}>
                <Typography className={classes.timeSummaryHeading}>Time Summary</Typography>
                <WorkTimer {...workTimerProps} />
              </Box>
              <TimeSummary data={timeSummary} eta={eta} />
            </Box>
          </Box>

          <DescriptionSection
            incident={incident}
            isEditing={isEditing}
            editFormData={editFormData}
            onEditFormChange={handleEditFormChange}
          />

          <TabsSection
            activeTab={activeTab}
            onTabChange={setActiveTab}
            incident={incident}
            comments={comments as any}
            resolutions={resolutions as any}
            activities={activities as any}
          />
        </Box>
      </Box>

      {/* ════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════ */}
      <PriorityChangeModal
        open={activeModal === 'priorityChange'}
        onClose={() => setActiveModal(null)}
        incident={incident}
        onUpdateTicket={updateTicket}
        onSuccess={() => {
          setActiveModal(null);
          showNotification('Priority updated successfully', 'success');
          refetch();
        }}
      />

      <AssignModal
        open={activeModal === 'assign'}
        onClose={() => setActiveModal(null)}
        incident={incident}
        onUpdateTicket={updateTicket}
        onSuccess={() => {
          setActiveModal(null);
          showNotification('Ticket assigned successfully', 'success');
          refetch();
        }}
      />

      <AttachmentModal
        open={activeModal === 'attachment'}
        onClose={() => setActiveModal(null)}
        incident={incident}
        onUpdateTicket={updateTicket}
        onSuccess={() => {
          setActiveModal(null);
          showNotification('Attachments updated', 'success');
          refetch();
        }}
      />

      <MoreToolsMenu
        anchorEl={moreToolsAnchorEl}
        onClose={handleMoreToolsClose}
        incident={incident}
        onCancelIncident={handleCancelIncident}
        onDuplicate={handleDuplicate}
      />

      {/* ════════════════════════════════════════════════════════════════
          WINDOWS
      ════════════════════════════════════════════════════════════════ */}
      <CommentWindow
        open={activeModal === 'comment'}
        onClose={() => setActiveModal(null)}
        incident={incident}
        onSuccess={() => {
          setActiveModal(null);
          showNotification('Comment added successfully', 'success');
          refetch();
        }}
      />

      <TimeEntryWindow
        open={activeModal === 'timeEntry'}
        onClose={() => setActiveModal(null)}
        incident={incident}
        onSuccess={() => {
          setActiveModal(null);
          showNotification('Time entry added successfully', 'success');
          refetch();
        }}
      />

      <ResolveWindow
        open={activeModal === 'resolve'}
        onClose={() => setActiveModal(null)}
        incident={incident}
        onUpdateTicket={updateTicket}
        onSuccess={() => {
          setActiveModal(null);
          showNotification('Ticket resolved successfully', 'success');
          refetch();
        }}
      />
    </Box>
  );
};

export default TicketDetailView;
