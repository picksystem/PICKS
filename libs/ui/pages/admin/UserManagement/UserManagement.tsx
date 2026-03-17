import { Box, Loader, DataTable } from '@picks/component';
import {
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Paper,
  Divider,
  Link,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import KeyIcon from '@mui/icons-material/Key';
import LockResetIcon from '@mui/icons-material/LockReset';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BadgeIcon from '@mui/icons-material/Badge';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TuneIcon from '@mui/icons-material/Tune';
import TabPanel from './components/TabPanel';
import useUserManagement from './hooks/useUserManagement';
import AdminControlsDialog from './dialogs/AdminControlsDialog/AdminControlsDialog';
import EditUserDialog from './dialogs/EditUserDialog/EditUserDialog';
import CreateUserDialog from './dialogs/CreateUserDialog/CreateUserDialog';
import ChangesLogDialog from './dialogs/ChangesLogDialog/ChangesLogDialog';
import LoginDataDialog from './dialogs/LoginDataDialog/LoginDataDialog';
import ConsultantProfileDialog from './dialogs/ConsultantProfileDialog/ConsultantProfileDialog';
import ChangeProfileDialog from './dialogs/ChangeProfileDialog/ChangeProfileDialog';
import TempPasswordDialog from './dialogs/TempPasswordDialog/TempPasswordDialog';
import ResetPasswordDialog from './dialogs/ResetPasswordDialog/ResetPasswordDialog';
import { useStyles } from './styles';

const UserManagement = () => {
  const { classes } = useStyles();

  const {
    // table
    allUsers,
    admins,
    consultants,
    isLoading,
    isMobile,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    selectedRow,
    setSelectedRow,
    handleRowClick,
    columns,
    getTableData,
    draftRow,
    currentUser,
    // edit
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    isSavingEdit,
    isDirty,
    adminNotes,
    setAdminNotes,
    handleOpenEdit,
    handleSaveEdit,
    // create
    createOpen,
    isOpenedAsDraft,
    setIsOpenedAsDraft,
    draftMeta,
    setDraftMeta,
    draftValues,
    setDraftValues,
    genPassword,
    showGenPw,
    setShowGenPw,
    createFormik,
    handleOpenNew,
    handleOpenDraft,
    handleRegeneratePw,
    handleApplyGenPw,
    handleSaveDraft,
    handleCancelCreate,
    reqError,
    // changes log
    changesLogOpen,
    setChangesLogOpen,
    changeLog,
    isLoadingLog,
    logSearch,
    setLogSearch,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
    logFilterField,
    setLogFilterField,
    logFilterReason,
    setLogFilterReason,
    logSortBy,
    logSortOrder,
    logPage,
    setLogPage,
    logRowsPerPage,
    setLogRowsPerPage,
    logMaximized,
    setLogMaximized,
    logShowFilters,
    setLogShowFilters,
    uniqueLogFields,
    filteredLog,
    paginatedLog,
    hasLogFilters,
    handleOpenChangesLog,
    handleLogSort,
    clearLogFilters,
    handleExportCsv,
    // login data
    loginDataOpen,
    setLoginDataOpen,
    // consultant profile
    consultantProfileOpen,
    setConsultantProfileOpen,
    // change profile
    changeProfileOpen,
    setChangeProfileOpen,
    changeProfileRole,
    setChangeProfileRole,
    changeProfileReasonCode,
    setChangeProfileReasonCode,
    changeProfileNoteText,
    setChangeProfileNoteText,
    changeProfileAttachment,
    setChangeProfileAttachment,
    changeProfileErrors,
    setChangeProfileErrors,
    changeProfileConfirmOpen,
    setChangeProfileConfirmOpen,
    isSavingProfile,
    changeProfileNoteRef,
    attachmentInputRef,
    handleOpenChangeProfile,
    handleChangeProfileSubmit,
    handleSaveChangeProfile,
    // temp password
    tempPwOpen,
    setTempPwOpen,
    isGeneratingTempPw,
    tempPwBulkMode,
    setTempPwBulkMode,
    bulkSelectedIds,
    setBulkSelectedIds,
    tempPwValidity,
    setTempPwValidity,
    tempPwForceReset,
    setTempPwForceReset,
    tempPwNote,
    setTempPwNote,
    handleOpenTempPw,
    handleGenerateTempPw,
    // reset password
    resetPwOpen,
    setResetPwOpen,
    newPassword,
    setNewPassword,
    newPasswordConfirm,
    setNewPasswordConfirm,
    isResettingPw,
    resetPwMode,
    setResetPwMode,
    autoResetPw,
    setAutoResetPw,
    showAutoResetPw,
    setShowAutoResetPw,
    showManualPw,
    setShowManualPw,
    showManualPwConfirm,
    setShowManualPwConfirm,
    resetPwForceChange,
    setResetPwForceChange,
    resetPwReason,
    setResetPwReason,
    resetPwErrors,
    setResetPwErrors,
    handleOpenResetPw,
    handleResetPassword,
    // admin controls
    adminControlsOpen,
    setAdminControlsOpen,
    adminTwoLevel,
    handleAdminTwoLevelChange,
    adminManagerOnly,
    handleAdminManagerOnlyChange,
    adminAdditionalApproval,
    handleAdminAdditionalApprovalChange,
    adminApprover,
    handleAdminApproverChange,
    handleAdminApproverBlur,
    isSavingControls,
    pageStyles,
    handlePageStyleChange,
    selectedTheme,
    handleThemeChange,
  } = useUserManagement();

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

  const sel = selectedRow;
  const isDraft = (sel?.id as unknown as number) === -1;
  const isConsultant = !isDraft && sel?.role === 'consultant';

  return (
    <Grid className={classes.container}>
      {/* ── Page header ── */}
      <Box className={classes.pageHeader}>
        <Box className={classes.pageHeaderRow}>
          <Typography variant='h5' className={classes.title}>
            User Management
          </Typography>
        </Box>
        <Typography variant='body2' className={classes.description}>
          View and manage all users across different roles in the system.
        </Typography>
      </Box>

      {/* ── Tabs + Search ── */}
      <Box className={classes.tabsBox}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => {
            setTabValue(v);
            setTableSearch('');
          }}
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
          sx={{ flex: 1 }}
        >
          <Tab
            icon={<GroupIcon />}
            iconPosition='start'
            label={isMobile ? undefined : `All Users (${allUsers.length})`}
            title={`All Users (${allUsers.length})`}
          />
          <Tab
            icon={<AdminPanelSettingsIcon />}
            iconPosition='start'
            label={isMobile ? undefined : `Admins (${admins.length})`}
            title={`Admins (${admins.length})`}
          />
          <Tab
            icon={<BusinessCenterIcon />}
            iconPosition='start'
            label={isMobile ? undefined : `Consultants (${consultants.length})`}
            title={`Consultants (${consultants.length})`}
          />
          <Tab
            icon={<PersonIcon />}
            iconPosition='start'
            label={
              isMobile ? undefined : `Users (${allUsers.filter((u) => u.role === 'user').length})`
            }
            title={`Users (${allUsers.filter((u) => u.role === 'user').length})`}
          />
        </Tabs>
        <TextField
          placeholder='Search...'
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
          className={classes.tabsSearchField}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* ── Action toolbar ── */}
      <Paper variant='outlined' className={classes.toolbar}>
        <Box className={classes.toolbarStack}>
          {/* Create — hidden when any row is selected */}
          {!sel && (
            <Tooltip title='Create new user'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleOpenNew}
              >
                <span className={classes.buttonLabel}>CREATE NEW USER</span>
              </Button>
            </Tooltip>
          )}

          {/* Open Draft — visible only when the draft row is selected */}
          {isDraft && draftValues && (
            <Tooltip title='Open saved draft'>
              <Button
                size='small'
                variant='contained'
                color='info'
                startIcon={<ScheduleIcon />}
                onClick={handleOpenDraft}
              >
                <span className={classes.buttonLabel}>Open Draft</span>
              </Button>
            </Tooltip>
          )}

          {/* Edit */}
          <Tooltip
            title={
              sel && !isDraft
                ? 'Edit selected user'
                : isDraft
                  ? 'Cannot edit a draft row'
                  : 'Select a user first'
            }
          >
            <span>
              <Button
                size='small'
                variant='outlined'
                startIcon={<EditIcon />}
                disabled={!sel || isDraft}
                onClick={handleOpenEdit}
              >
                <span className={classes.buttonLabel}>Edit</span>
              </Button>
            </span>
          </Tooltip>

          {!isMobile && (
            <Divider orientation='vertical' flexItem className={classes.dividerMobile} />
          )}

          {/* Consultant Profile */}
          <Tooltip title={isConsultant ? 'View consultant profile' : 'Select a consultant user'}>
            <span>
              <Button
                size='small'
                variant='outlined'
                startIcon={<BadgeIcon />}
                disabled={!isConsultant}
                onClick={() => setConsultantProfileOpen(true)}
              >
                <span className={classes.buttonLabel}>Consultant Profile</span>
              </Button>
            </span>
          </Tooltip>

          {/* Change Profile */}
          <Tooltip
            title={
              sel && !isDraft
                ? 'Change user role / profile'
                : isDraft
                  ? 'Cannot change profile for a draft'
                  : 'Select a user first'
            }
          >
            <span>
              <Button
                size='small'
                variant='outlined'
                startIcon={<ManageAccountsIcon />}
                disabled={!sel || isDraft}
                onClick={handleOpenChangeProfile}
              >
                <span className={classes.buttonLabel}>Change Profile</span>
              </Button>
            </span>
          </Tooltip>

          {!isMobile && (
            <Divider orientation='vertical' flexItem className={classes.dividerMobile} />
          )}

          {/* Changes Log */}
          <Tooltip
            title={
              sel && !isDraft
                ? 'View change history'
                : isDraft
                  ? 'No change history for a draft'
                  : 'Select a user first'
            }
          >
            <span>
              <Button
                size='small'
                variant='outlined'
                startIcon={<HistoryIcon />}
                disabled={!sel || isDraft}
                onClick={handleOpenChangesLog}
              >
                <span className={classes.buttonLabel}>Changes Log</span>
              </Button>
            </span>
          </Tooltip>

          {/* Login Data */}
          <Tooltip
            title={
              sel && !isDraft
                ? 'View login activity'
                : isDraft
                  ? 'No login data for a draft'
                  : 'Select a user first'
            }
          >
            <span>
              <Button
                size='small'
                variant='outlined'
                startIcon={<LoginIcon />}
                disabled={!sel || isDraft}
                onClick={() => setLoginDataOpen(true)}
              >
                <span className={classes.buttonLabel}>Login Data</span>
              </Button>
            </span>
          </Tooltip>

          {!isMobile && (
            <Divider orientation='vertical' flexItem className={classes.dividerMobile} />
          )}

          {/* Generate Temp Password */}
          <Tooltip
            title={
              sel && !isDraft
                ? 'Generate and email a temporary password'
                : isDraft
                  ? 'Not available for a draft'
                  : 'Select a user first'
            }
          >
            <span>
              <Button
                size='small'
                variant='outlined'
                color='warning'
                startIcon={<KeyIcon />}
                disabled={!sel || isDraft}
                onClick={handleOpenTempPw}
              >
                <span className={classes.buttonLabel}>Generate Temp Password</span>
              </Button>
            </span>
          </Tooltip>

          {/* Reset Password */}
          <Tooltip
            title={
              sel && !isDraft
                ? 'Manually reset user password'
                : isDraft
                  ? 'Not available for a draft'
                  : 'Select a user first'
            }
          >
            <span>
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<LockResetIcon />}
                disabled={!sel || isDraft}
                onClick={handleOpenResetPw}
              >
                <span className={classes.buttonLabel}>Reset Password</span>
              </Button>
            </span>
          </Tooltip>

          {/* Admin Controls — always at far right */}
          <Tooltip title='Approval settings & page styles'>
            <Button
              size='small'
              variant={adminControlsOpen ? 'contained' : 'outlined'}
              color='secondary'
              startIcon={<TuneIcon />}
              onClick={() => setAdminControlsOpen(true)}
              className={classes.adminControlsBtn}
            >
              <span className={classes.buttonLabel}>Admin Controls</span>
            </Button>
          </Tooltip>
        </Box>

        {/* Selection indicator */}
        {sel && (
          <Typography
            variant='caption'
            color='text.secondary'
            className={classes.selectionIndicator}
          >
            Selected: <strong>{sel.name}</strong> ({sel.email}) &nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedRow(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>

      {/* ── Tab panels with DataTable ── */}
      {[allUsers, admins, consultants, allUsers.filter((u) => u.role === 'user')].map(
        (list, idx) => {
          const tableData =
            idx === 0 && draftRow
              ? [{ ...draftRow, sno: 1 }, ...getTableData(list, 2)]
              : getTableData(list);
          const filteredData = tableSearch
            ? tableData.filter((row) =>
                Object.values(row).some(
                  (val) =>
                    val !== null &&
                    val !== undefined &&
                    String(val).toLowerCase().includes(tableSearch.toLowerCase()),
                ),
              )
            : tableData;
          return (
            <TabPanel key={idx} value={tabValue} index={idx}>
              <Box className={classes.tableContainer}>
                <DataTable
                  columns={columns}
                  data={filteredData}
                  rowKey='id'
                  searchable={false}
                  initialRowsPerPage={10}
                  onRowClick={handleRowClick}
                  activeRowKey={selectedRow?.id as number}
                />
              </Box>
            </TabPanel>
          );
        },
      )}

      {/* ════════════════════════════════════════════════════════════════
          DIALOGS
      ════════════════════════════════════════════════════════════════ */}

      <AdminControlsDialog
        open={adminControlsOpen}
        onClose={() => setAdminControlsOpen(false)}
        adminTwoLevel={adminTwoLevel}
        onAdminTwoLevelChange={handleAdminTwoLevelChange}
        adminManagerOnly={adminManagerOnly}
        onAdminManagerOnlyChange={handleAdminManagerOnlyChange}
        adminAdditionalApproval={adminAdditionalApproval}
        onAdminAdditionalApprovalChange={handleAdminAdditionalApprovalChange}
        adminApprover={adminApprover}
        onAdminApproverChange={handleAdminApproverChange}
        onAdminApproverBlur={handleAdminApproverBlur}
        isSaving={isSavingControls}
        pageStyles={pageStyles}
        onPageStyleChange={handlePageStyleChange}
        selectedTheme={selectedTheme}
        onThemeChange={handleThemeChange}
      />

      <EditUserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        selectedRow={selectedRow}
        editForm={editForm}
        onFormChange={setEditForm}
        isSaving={isSavingEdit}
        isDirty={isDirty}
        onSave={handleSaveEdit}
        currentUserId={currentUser?.id}
      />

      <CreateUserDialog
        open={createOpen}
        onClose={handleCancelCreate}
        createFormik={createFormik}
        reqError={reqError}
        genPassword={genPassword}
        showGenPw={showGenPw}
        setShowGenPw={setShowGenPw}
        onRegeneratePw={handleRegeneratePw}
        onApplyGenPw={handleApplyGenPw}
        onSaveDraft={handleSaveDraft}
        draftMeta={draftMeta}
        setDraftMeta={setDraftMeta}
        setDraftValues={setDraftValues}
        isOpenedAsDraft={isOpenedAsDraft}
        setIsOpenedAsDraft={setIsOpenedAsDraft}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
      />

      <ChangesLogDialog
        open={changesLogOpen}
        onClose={() => setChangesLogOpen(false)}
        selectedRow={selectedRow}
        isLoadingLog={isLoadingLog}
        changeLog={changeLog}
        logSearch={logSearch}
        onLogSearchChange={setLogSearch}
        logDateFrom={logDateFrom}
        onLogDateFromChange={setLogDateFrom}
        logDateTo={logDateTo}
        onLogDateToChange={setLogDateTo}
        logFilterField={logFilterField}
        onLogFilterFieldChange={setLogFilterField}
        logFilterReason={logFilterReason}
        onLogFilterReasonChange={setLogFilterReason}
        logSortBy={logSortBy}
        logSortOrder={logSortOrder}
        logPage={logPage}
        onLogPageChange={setLogPage}
        logRowsPerPage={logRowsPerPage}
        onLogRowsPerPageChange={setLogRowsPerPage}
        logMaximized={logMaximized}
        onLogMaximizedChange={setLogMaximized}
        logShowFilters={logShowFilters}
        onLogShowFiltersChange={setLogShowFilters}
        uniqueLogFields={uniqueLogFields}
        filteredLog={filteredLog}
        paginatedLog={paginatedLog}
        hasLogFilters={hasLogFilters}
        onLogSort={handleLogSort}
        onClearLogFilters={clearLogFilters}
        onExportCsv={handleExportCsv}
      />

      <LoginDataDialog
        open={loginDataOpen}
        onClose={() => setLoginDataOpen(false)}
        selectedRow={selectedRow}
      />

      <ConsultantProfileDialog
        open={consultantProfileOpen}
        onClose={() => setConsultantProfileOpen(false)}
        selectedRow={selectedRow}
      />

      <ChangeProfileDialog
        open={changeProfileOpen}
        onClose={() => setChangeProfileOpen(false)}
        confirmOpen={changeProfileConfirmOpen}
        onConfirmClose={() => setChangeProfileConfirmOpen(false)}
        selectedRow={selectedRow}
        changeProfileRole={changeProfileRole}
        onRoleChange={setChangeProfileRole}
        changeProfileReasonCode={changeProfileReasonCode}
        onReasonCodeChange={setChangeProfileReasonCode}
        changeProfileNoteText={changeProfileNoteText}
        onNoteTextChange={setChangeProfileNoteText}
        changeProfileAttachment={changeProfileAttachment}
        onAttachmentChange={setChangeProfileAttachment}
        changeProfileErrors={changeProfileErrors}
        onErrorsChange={setChangeProfileErrors}
        isSaving={isSavingProfile}
        noteRef={changeProfileNoteRef}
        attachmentInputRef={attachmentInputRef}
        onSubmit={handleChangeProfileSubmit}
        onConfirmSave={handleSaveChangeProfile}
      />

      <TempPasswordDialog
        open={tempPwOpen}
        onClose={() => setTempPwOpen(false)}
        selectedRow={selectedRow}
        allUsers={allUsers}
        tempPwBulkMode={tempPwBulkMode}
        onBulkModeChange={setTempPwBulkMode}
        bulkSelectedIds={bulkSelectedIds}
        onBulkIdsChange={setBulkSelectedIds}
        tempPwValidity={tempPwValidity}
        onValidityChange={setTempPwValidity}
        tempPwForceReset={tempPwForceReset}
        onForceResetChange={setTempPwForceReset}
        tempPwNote={tempPwNote}
        onNoteChange={setTempPwNote}
        isGenerating={isGeneratingTempPw}
        onGenerate={handleGenerateTempPw}
      />

      <ResetPasswordDialog
        open={resetPwOpen}
        onClose={() => setResetPwOpen(false)}
        selectedRow={selectedRow}
        resetPwMode={resetPwMode}
        onModeChange={setResetPwMode}
        autoResetPw={autoResetPw}
        onAutoResetPwChange={setAutoResetPw}
        showAutoResetPw={showAutoResetPw}
        onShowAutoResetPwChange={setShowAutoResetPw}
        newPassword={newPassword}
        onNewPasswordChange={setNewPassword}
        newPasswordConfirm={newPasswordConfirm}
        onNewPasswordConfirmChange={setNewPasswordConfirm}
        showManualPw={showManualPw}
        onShowManualPwChange={setShowManualPw}
        showManualPwConfirm={showManualPwConfirm}
        onShowManualPwConfirmChange={setShowManualPwConfirm}
        resetPwForceChange={resetPwForceChange}
        onForceChangeChange={setResetPwForceChange}
        resetPwReason={resetPwReason}
        onReasonChange={setResetPwReason}
        resetPwErrors={resetPwErrors}
        onErrorsChange={setResetPwErrors}
        isResetting={isResettingPw}
        onReset={handleResetPassword}
      />
    </Grid>
  );
};

export default UserManagement;
