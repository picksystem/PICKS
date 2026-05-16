import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { LazyMenuItems } from './routes';
import { constants } from '@serviceops/utils';
import { ErrorBoundary, MainContent } from '@serviceops/component';
import { useAuth } from '@serviceops/hooks';
import { AppRoleContext } from '@serviceops/theme';

const {
  BaseDashboardPage,
  BaseFavouritesPage,
  BaseRecentItemsPage,
  BaseIncidentManagementPage,
  BaseChangeManagementPage,
  BaseProblemManagementPage,
  BaseTimeManagementPage,
  BaseReportsPage,
  BaseTicketTemplatesPage,
  BaseCabRequestPage,
  BaseKnowledgeBasePage,
  BaseTestScriptsPage,
  BaseCreateTicketPage,
  BaseCreateTicketFormPage,
  BaseUserManagementPage,
  BaseRoleRequestsPage,
  BaseConsultantProfilePage,
  BaseProfilePage,
  BaseIncidentDetailPage,
  BaseTicketDetailPage,
  BaseSuggestedSolutionPage,
  BaseHeaderPage,
  BaseSideNavPage,
  BaseConfigurationPage,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  NotFoundPage,
} = LazyMenuItems;

const AppRoutes = () => {
  const { BasePath, UserPath, ConsultantPath, AuthPath, Path, DefalutPage } = constants;
  const { isAuthenticated, isAdmin, isConsultant } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path={AuthPath.SIGNIN} element={<SignInPage />} />
          <Route path={AuthPath.SIGNUP} element={<SignUpPage />} />
          <Route path={AuthPath.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={Path.NOT_FOUND} element={<Navigate to={AuthPath.SIGNIN} replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  const currentPath = location.pathname;
  const isOnUserPage = currentPath.startsWith('/app/user');
  const isOnConsultantPage = currentPath.startsWith('/app/consultant');

  // Determine effective role - admin can switch modes
  let effectiveRole: 'admin' | 'user' | 'consultant' = 'admin';
  if (isConsultant) {
    effectiveRole = 'consultant';
  } else if (isAdmin) {
    if (isOnUserPage) effectiveRole = 'user';
    else if (isOnConsultantPage) effectiveRole = 'consultant';
  }

  // Get mode-specific paths
  const getModeDashboard = () => {
    if (effectiveRole === 'user') return UserPath.DASHBOARD;
    if (effectiveRole === 'consultant') return ConsultantPath.DASHBOARD;
    return BasePath.DASHBOARD;
  };

  const getModeIncidentManagement = () => {
    if (effectiveRole === 'user') return UserPath.INCIDENT_MANAGEMENT;
    if (effectiveRole === 'consultant') return ConsultantPath.INCIDENT_MANAGEMENT;
    return BasePath.INCIDENT_MANAGEMENT;
  };

  const getModeFavourites = () => {
    if (effectiveRole === 'user') return UserPath.FAVOURITES;
    if (effectiveRole === 'consultant') return ConsultantPath.FAVOURITES;
    return BasePath.FAVOURITES;
  };

  const getModeRecentItems = () => {
    if (effectiveRole === 'user') return UserPath.RECENT_ITEMS;
    if (effectiveRole === 'consultant') return ConsultantPath.RECENT_ITEMS;
    return BasePath.RECENT_ITEMS;
  };

  const getModeChangeManagement = () => {
    if (effectiveRole === 'consultant') return ConsultantPath.CHANGE_MANAGEMENT;
    if (effectiveRole === 'user') return UserPath.CHANGE_MANAGEMENT;
    return BasePath.CHANGE_MANAGEMENT;
  };

  const getModeProblemManagement = () => {
    if (effectiveRole === 'consultant') return ConsultantPath.PROBLEM_MANAGEMENT;
    if (effectiveRole === 'user') return UserPath.PROBLEM_MANAGEMENT;
    return BasePath.PROBLEM_MANAGEMENT;
  };

  const getModeCreateTicket = () => {
    if (effectiveRole === 'consultant') return ConsultantPath.CREATE_TICKET;
    if (effectiveRole === 'user') return UserPath.CREATE_TICKET;
    return BasePath.CREATE_TICKET;
  };

  const getModeProfile = () => {
    if (effectiveRole === 'consultant') return ConsultantPath.PROFILE || BasePath.PROFILE;
    if (effectiveRole === 'user') return UserPath.PROFILE || BasePath.PROFILE;
    return BasePath.PROFILE;
  };

  const getModeIncidentDetail = () => {
    if (effectiveRole === 'consultant')
      return ConsultantPath.INCIDENT_DETAIL || BasePath.INCIDENT_DETAIL;
    if (effectiveRole === 'user') return UserPath.INCIDENT_DETAIL || BasePath.INCIDENT_DETAIL;
    return BasePath.INCIDENT_DETAIL;
  };

  const getModeTicketDetail = () => {
    if (effectiveRole === 'consultant')
      return ConsultantPath.TICKET_DETAIL || BasePath.TICKET_DETAIL;
    if (effectiveRole === 'user') return UserPath.TICKET_DETAIL || BasePath.TICKET_DETAIL;
    return BasePath.TICKET_DETAIL;
  };

  const isOnIncidentDetail =
    currentPath.match(/^\/app\/(?:admin|user|consultant)\/incident\/.+/) ||
    currentPath.match(/^\/app\/(?:admin|user|consultant)\/ticket\/.+/);
  const isOnConfiguration = currentPath.startsWith('/app/admin/configuration');

  if (isAdmin) {
    return (
      <AppRoleContext.Provider value={effectiveRole}>
        <ErrorBoundary>
          {!isOnIncidentDetail && (
            <>
              <BaseHeaderPage />
              <BaseSideNavPage />
            </>
          )}
          {isOnIncidentDetail ? (
            <Routes>
              <Route path={getModeIncidentDetail()} element={<BaseIncidentDetailPage />} />
              <Route path={getModeTicketDetail()} element={<BaseTicketDetailPage />} />
            </Routes>
          ) : isOnConfiguration ? (
            <Routes>
              <Route path={`${BasePath.CONFIGURATION}/*`} element={<BaseConfigurationPage />} />
            </Routes>
          ) : (
            <MainContent>
              <Routes>
                <Route
                  path={Path.DEFAULT_PAGE}
                  element={<Navigate to={getModeDashboard()} replace />}
                />
                <Route path={getModeDashboard()} element={<BaseDashboardPage />} />
                <Route path={getModeFavourites()} element={<BaseFavouritesPage />} />
                <Route path={getModeRecentItems()} element={<BaseRecentItemsPage />} />
                <Route
                  path={getModeIncidentManagement()}
                  element={<BaseIncidentManagementPage />}
                />
                <Route path={getModeChangeManagement()} element={<BaseChangeManagementPage />} />
                <Route path={getModeProblemManagement()} element={<BaseProblemManagementPage />} />
                <Route path={getModeCreateTicket()} element={<BaseCreateTicketPage />} />
                <Route path={getModeProfile()} element={<BaseProfilePage />} />
                <Route path={getModeIncidentDetail()} element={<BaseIncidentDetailPage />} />
                <Route path={getModeTicketDetail()} element={<BaseTicketDetailPage />} />
                <Route path={BasePath.SUGGESTED_SOLUTION} element={<BaseSuggestedSolutionPage />} />
                {effectiveRole === 'admin' && (
                  <>
                    <Route path={BasePath.TIME_MANAGEMENT} element={<BaseTimeManagementPage />} />
                    <Route path={BasePath.REPORTS} element={<BaseReportsPage />} />
                    <Route path={BasePath.TICKET_TEMPLATES} element={<BaseTicketTemplatesPage />} />
                    <Route path={BasePath.CAB_REQUEST} element={<BaseCabRequestPage />} />
                    <Route path={BasePath.KNOWLEDGE_BASE} element={<BaseKnowledgeBasePage />} />
                    <Route path={BasePath.TEST_SCRIPTS} element={<BaseTestScriptsPage />} />
                    <Route path={BasePath.CREATE_TICKET} element={<BaseCreateTicketPage />} />
                    <Route
                      path={BasePath.CREATE_TICKET_TYPE}
                      element={<BaseCreateTicketFormPage />}
                    />
                    <Route path={BasePath.USER_MANAGEMENT} element={<BaseUserManagementPage />} />
                    <Route path={BasePath.ROLE_REQUESTS} element={<BaseRoleRequestsPage />} />
                    <Route
                      path={BasePath.CONSULTANT_PROFILE}
                      element={<BaseConsultantProfilePage />}
                    />
                  </>
                )}
                <Route path={Path.NOT_FOUND} element={<NotFoundPage />} />
              </Routes>
            </MainContent>
          )}
        </ErrorBoundary>
      </AppRoleContext.Provider>
    );
  }

  if (isConsultant) {
    return (
      <AppRoleContext.Provider value='consultant'>
        <ErrorBoundary>
          <>
            <BaseHeaderPage />
            <BaseSideNavPage />
          </>
          <MainContent>
            <Routes>
              <Route
                path={Path.DEFAULT_PAGE}
                element={<Navigate to={ConsultantPath.DASHBOARD} replace />}
              />
              <Route path={ConsultantPath.DASHBOARD} element={<BaseDashboardPage />} />
              <Route path={ConsultantPath.FAVOURITES} element={<BaseFavouritesPage />} />
              <Route path={ConsultantPath.RECENT_ITEMS} element={<BaseRecentItemsPage />} />
              <Route
                path={ConsultantPath.INCIDENT_MANAGEMENT}
                element={<BaseIncidentManagementPage />}
              />
              <Route
                path={ConsultantPath.CHANGE_MANAGEMENT}
                element={<BaseChangeManagementPage />}
              />
              <Route
                path={ConsultantPath.PROBLEM_MANAGEMENT}
                element={<BaseProblemManagementPage />}
              />
              <Route path={ConsultantPath.CREATE_TICKET} element={<BaseCreateTicketPage />} />
              <Route path={ConsultantPath.PROFILE} element={<BaseProfilePage />} />
              <Route path={ConsultantPath.INCIDENT_DETAIL} element={<BaseIncidentDetailPage />} />
              <Route
                path={DefalutPage.BASE_DEFAULT_PAGE}
                element={<Navigate to={ConsultantPath.DASHBOARD} replace />}
              />
              <Route path={Path.NOT_FOUND} element={<NotFoundPage />} />
            </Routes>
          </MainContent>
        </ErrorBoundary>
      </AppRoleContext.Provider>
    );
  }

  return (
    <AppRoleContext.Provider value='user'>
      <ErrorBoundary>
        <BaseHeaderPage />
        <BaseSideNavPage />
        <MainContent>
          <Routes>
            <Route
              path={Path.DEFAULT_PAGE}
              element={<Navigate to={UserPath.DASHBOARD} replace />}
            />
            <Route path={UserPath.DASHBOARD} element={<BaseDashboardPage />} />
            <Route path={UserPath.FAVOURITES} element={<BaseFavouritesPage />} />
            <Route path={UserPath.RECENT_ITEMS} element={<BaseRecentItemsPage />} />
            <Route path={UserPath.INCIDENT_MANAGEMENT} element={<BaseIncidentManagementPage />} />
            <Route path={UserPath.CHANGE_MANAGEMENT} element={<BaseChangeManagementPage />} />
            <Route path={UserPath.PROBLEM_MANAGEMENT} element={<BaseProblemManagementPage />} />
            <Route path={UserPath.PROFILE} element={<BaseProfilePage />} />
            <Route path={UserPath.INCIDENT_DETAIL} element={<BaseIncidentDetailPage />} />
            <Route
              path={DefalutPage.BASE_DEFAULT_PAGE}
              element={<Navigate to={UserPath.DASHBOARD} replace />}
            />
            <Route
              path={DefalutPage.CONSULTANT_DEFAULT_PAGE}
              element={<Navigate to={UserPath.DASHBOARD} replace />}
            />
            <Route path={Path.NOT_FOUND} element={<NotFoundPage />} />
          </Routes>
        </MainContent>
      </ErrorBoundary>
    </AppRoleContext.Provider>
  );
};

const App = () => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AppRoutes />
  </LocalizationProvider>
);

export default App;
