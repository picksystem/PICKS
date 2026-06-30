import { Box, Loader } from '@serviceops/component';
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
import { UserManagementSection } from './sections/UserManagementSection';
import { FieldConfigurationsAccordion } from './sections/FieldConfigurationsAccordion';
import type { UserRow } from './types/userManagement.types';

const UserManagement = () => {
  const { classes } = useStyles();

  const {
    isLoading,
    allUsers,
    columns,
    tableSearch,
    setTableSearch,
    selectedRow,
    setSelectedRow,
    handleRowClick,
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

  const sel = selectedRow as UserRow | null;
  const isDraft = (sel?.id as unknown as number) === -1;
  const isConsultant = !isDraft && sel?.role === 'consultant';

  return (
    <Box className={classes.container}>
      <UserManagementSection
        allUsers={allUsers}
        columns={columns}
        tableSearch={tableSearch}
        onTableSearchChange={setTableSearch}
        selectedRow={sel}
        onRowSelect={setSelectedRow as (row: UserRow | null) => void}
        onRowClick={handleRowClick as (row: UserRow) => void}
        onOpenNew={handleOpenNew}
        onOpenDraft={handleOpenDraft}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
        onOpenChangesLog={handleOpenChangesLog}
        onOpenLoginData={() => setLoginDataOpen(true)}
        onOpenConsultantProfile={() => setConsultantProfileOpen(true)}
        onOpenChangeProfile={handleOpenChangeProfile}
        onOpenTempPw={handleOpenTempPw}
        onOpenResetPw={handleOpenResetPw}
        onOpenAdminControls={() => setAdminControlsOpen(true)}
        adminControlsOpen={adminControlsOpen}
        isDraft={isDraft}
        isConsultant={isConsultant}
        draftValues={draftValues}
      />

      <FieldConfigurationsAccordion />

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
