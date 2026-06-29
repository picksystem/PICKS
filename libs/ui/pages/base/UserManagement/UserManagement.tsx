import {
  Box,
  Loader,
  DataTable,
  Button,
  Divider,
  Tooltip,
  TextField,
  DeleteIcon,
} from '@serviceops/component';
import { InputAdornment } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
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
import EditNoteIcon from '@mui/icons-material/EditNote';
import ClearIcon from '@mui/icons-material/Clear';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { IAuthUser } from '@serviceops/interfaces';
import { UserRow } from './types/userManagement.types';
import { FIELD_CONFIG_TABLE, FIELD_CONFIG_COLUMNS } from './components/fieldConfig.config';
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
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { useStyles } from './styles';

const ACCENT = '#0369a1';

const DEFAULT_FIELDS = [
  { date: '', day: '', calendarWeek: '', calendarMonth: '', control: 'Date' },
  { date: '', day: '', calendarWeek: '', calendarMonth: '', control: 'Day' },
  { date: '', day: '', calendarWeek: '', calendarMonth: '', control: 'Calendar week' },
  { date: '', day: '', calendarWeek: '', calendarMonth: '', control: 'Calendar month' },
  { date: '', day: '', calendarWeek: '', calendarMonth: '', control: 'Control' },
];

const UserManagement = () => {
  const { classes } = useStyles();

  const {
    allUsers,
    isLoading,
    tableSearch,
    setTableSearch,
    selectedRow,
    setSelectedRow,
    handleRowClick,
    columns,
    currentUser,
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
    loginDataOpen,
    setLoginDataOpen,
    consultantProfileOpen,
    setConsultantProfileOpen,
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
    adminControlsOpen,
    setAdminControlsOpen,
    confirmDeleteOpen,
    handleOpenDelete,
    handleCloseDelete,
    handleDeleteUser,
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

  const getTableDataFn = (users: IAuthUser[], startFrom = 1): UserRow[] =>
    users.map((u, i) => ({ ...u, sno: startFrom + i }));

  const tableData = getTableDataFn(allUsers);
  const filteredTableData = tableSearch
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
    <Box className={classes.container}>
      <Box className={classes.adminControlsWrapper}>
        <Tooltip title='Approval settings & page styles'>
          <Button
            size='small'
            variant={adminControlsOpen ? 'outlined' : 'contained'}
            color='primary'
            startIcon={<TuneIcon />}
            onClick={() => setAdminControlsOpen(true)}
            className={classes.adminControlsBtn}
          >
            Admin Controls
          </Button>
        </Tooltip>
      </Box>

      <GenericAccordion
        title='User Management'
        subtitle='View and manage all users across different roles in the system'
        icon={<GroupIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
        accent={ACCENT}
        className={classes.sectionAccordion}
      >
        <GenericToolbar className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!sel && (
              <Tooltip title='Create new user'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenNew}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Add New User
                </Button>
              </Tooltip>
            )}

            {isDraft && draftValues && (
              <Tooltip title='Open saved draft'>
                <Button
                  size='small'
                  variant='contained'
                  color='info'
                  startIcon={<ScheduleIcon />}
                  onClick={handleOpenDraft}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Open Draft
                </Button>
              </Tooltip>
            )}

            {sel && (
              <Tooltip title={!isDraft ? 'Edit selected user' : 'Cannot edit a draft row'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<EditIcon />}
                    disabled={isDraft}
                    onClick={handleOpenEdit}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Edit
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {sel && (
              <Tooltip title='Delete selected user'>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenDelete}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Delete
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && (
              <Box
                component='span'
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  width: '1px',
                  height: '20px',
                  bgcolor: 'divider',
                  mx: 0.75,
                  alignSelf: 'center',
                }}
              />
            )}

            {sel && (
              <Tooltip title='Clear selection'>
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedRow(null)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Clear
                </Button>
              </Tooltip>
            )}

            {sel && isConsultant && (
              <Tooltip title='View consultant profile'>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<BadgeIcon />}
                    onClick={() => setConsultantProfileOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Consultant Profile
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && (
              <Tooltip
                title={
                  !isDraft ? 'Change user role / profile' : 'Cannot change profile for a draft'
                }
              >
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<ManageAccountsIcon />}
                    disabled={isDraft}
                    onClick={handleOpenChangeProfile}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Change Profile
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {sel && (
              <Tooltip title={!isDraft ? 'View change history' : 'No change history for a draft'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<HistoryIcon />}
                    disabled={isDraft}
                    onClick={handleOpenChangesLog}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Changes Log
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && (
              <Tooltip title={!isDraft ? 'View login activity' : 'No login data for a draft'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<LoginIcon />}
                    disabled={isDraft}
                    onClick={() => setLoginDataOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Login Data
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {sel && (
              <Tooltip
                title={
                  !isDraft ? 'Generate and email a temporary password' : 'Not available for a draft'
                }
              >
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    color='warning'
                    startIcon={<KeyIcon />}
                    disabled={isDraft}
                    onClick={handleOpenTempPw}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Generate Temp Password
                  </Button>
                </span>
              </Tooltip>
            )}

            {sel && (
              <Tooltip
                title={!isDraft ? 'Manually reset user password' : 'Not available for a draft'}
              >
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<LockResetIcon />}
                    disabled={isDraft}
                    onClick={handleOpenResetPw}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Reset Password
                  </Button>
                </span>
              </Tooltip>
            )}

            {!sel && (
              <TextField
                placeholder='Search...'
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className={classes.toolbarSearchField}
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
            )}
          </Box>
        </GenericToolbar>

        <Box className={classes.tablePaper} sx={{ boxShadow: 1, bgcolor: 'background.paper' }}>
          <DataTable
            columns={columns}
            data={filteredTableData}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={handleRowClick}
            activeRowKey={selectedRow?.id as number}
          />
        </Box>
      </GenericAccordion>

      <GenericAccordion
        title='Field Configurations'
        subtitle='Define field metadata, types, lengths, and validation rules'
        icon={<EditNoteIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
        accent={ACCENT}
        className={classes.sectionAccordion}
      >
        <GenericPanel
          config={FIELD_CONFIG_TABLE}
          data={DEFAULT_FIELDS.map((field, index) => ({
            id: String(index + 1),
            ...field,
          }))}
          onSave={(data) => {
            console.log('Field configurations saved:', data);
          }}
          customColumns={FIELD_CONFIG_COLUMNS as unknown as never}
          variant='standard'
          enableSuccessMessage
          hideHeader
        />
      </GenericAccordion>

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

      <ConfigDeleteDialog
        open={confirmDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteUser}
        entityName='User'
        itemName={selectedRow?.name || selectedRow?.email || ''}
        confirmLabel='Delete'
      />
    </Box>
  );
};

export default UserManagement;
