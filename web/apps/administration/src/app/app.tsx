import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { LazyMenuItems } from './routes';
import { constants } from '@serviceops/utils';
import { ErrorBoundary, MainContent } from '@serviceops/component';
import { useAuth } from '@serviceops/hooks';
import { AppRoleContext } from '@serviceops/theme';

const {
  // Admin pages
  AdminDashboardPage,
  AdminFavouritesPage,
  AdminRecentItemsPage,
  AdminIncidentManagementPage,
  AdminChangeManagementPage,
  AdminProblemManagementPage,
  AdminTimeManagementPage,
  AdminReportsPage,
  AdminTicketTemplatesPage,
  AdminCabRequestPage,
  AdminKnowledgeBasePage,
  AdminTestScriptsPage,
  AdminCreateTicketPage,
  AdminCreateTicketFormPage,
  AdminUserManagementPage,
  AdminRoleRequestsPage,
  AdminConsultantProfilePage,
  AdminProfilePage,
  AdminIncidentDetailPage,
  AdminTicketDetailPage,
  AdminSuggestedSolutionPage,
  AdminHeaderPage,
  AdminSideNavPage,
  AdminConfigurationPage,

  // User pages
  UserDashboardPage,
  UserFavouritesPage,
  UserRecentItemsPage,
  UserIncidentManagementPage,
  UserChangeManagementPage,
  UserProblemManagementPage,
  UserHeaderPage,
  UserSideNavPage,

  // Consultant pages
  ConsultantDashboardPage,
  ConsultantChangeManagementPage,
  ConsultantProblemManagementPage,
  ConsultantCreateTicketPage,
  ConsultantHeaderPage,
  ConsultantSideNavPage,

  // Auth pages
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  NotFoundPage,
} = LazyMenuItems;

const AppRoutes = () => {
  const { AdminPath, UserPath, ConsultantPath, AuthPath, Path, DefalutPage } = constants;
  const { isAuthenticated, isAdmin, isConsultant } = useAuth();
  const location = useLocation();

  // Not authenticated — show auth pages
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

  // Authenticated as Admin — admin layout + admin routes
  if (isAdmin) {
    // Check which page admin is viewing
    const isOnUserPage = location.pathname.startsWith('/app/user');
    const isOnConsultantPage = location.pathname.startsWith('/app/consultant');
    const isOnIncidentDetail =
      location.pathname.match(/^\/app\/admin\/incident\/.+/) ||
      location.pathname.match(/^\/app\/admin\/ticket\/.+/);
    const isOnConfiguration = location.pathname.startsWith('/app/admin/configuration');

    let contextValue: 'admin' | 'user' | 'consultant' = 'admin';
    if (isOnUserPage) contextValue = 'user';
    if (isOnConsultantPage) contextValue = 'consultant';

    return (
      <AppRoleContext.Provider value={contextValue}>
        <ErrorBoundary>
          {!isOnIncidentDetail &&
            (isOnUserPage ? (
              <>
                <UserHeaderPage />
                <UserSideNavPage />
              </>
            ) : isOnConsultantPage ? (
              <>
                <ConsultantHeaderPage />
                <ConsultantSideNavPage />
              </>
            ) : (
              <>
                <AdminHeaderPage />
                <AdminSideNavPage />
              </>
            ))}
          {isOnIncidentDetail ? (
            <Routes>
              <Route path={AdminPath.INCIDENT_DETAIL} element={<AdminIncidentDetailPage />} />
              <Route path={AdminPath.TICKET_DETAIL} element={<AdminTicketDetailPage />} />
            </Routes>
          ) : isOnConfiguration ? (
            <Routes>
              <Route path={`${AdminPath.CONFIGURATION}/*`} element={<AdminConfigurationPage />} />
            </Routes>
          ) : (
            <MainContent>
              <Routes>
                {/* Redirect root to admin dashboard */}
                <Route
                  path={Path.DEFAULT_PAGE}
                  element={<Navigate to={AdminPath.DASHBOARD} replace />}
                />

                {/* Admin routes */}
                <Route path={AdminPath.DASHBOARD} element={<AdminDashboardPage />} />
                <Route path={AdminPath.FAVOURITES} element={<AdminFavouritesPage />} />
                <Route path={AdminPath.RECENT_ITEMS} element={<AdminRecentItemsPage />} />
                <Route
                  path={AdminPath.INCIDENT_MANAGEMENT}
                  element={<AdminIncidentManagementPage />}
                />
                <Route path={AdminPath.CHANGE_MANAGEMENT} element={<AdminChangeManagementPage />} />
                <Route
                  path={AdminPath.PROBLEM_MANAGEMENT}
                  element={<AdminProblemManagementPage />}
                />
                <Route path={AdminPath.TIME_MANAGEMENT} element={<AdminTimeManagementPage />} />
                <Route path={AdminPath.REPORTS} element={<AdminReportsPage />} />
                <Route path={AdminPath.TICKET_TEMPLATES} element={<AdminTicketTemplatesPage />} />
                <Route path={AdminPath.CAB_REQUEST} element={<AdminCabRequestPage />} />
                <Route path={AdminPath.KNOWLEDGE_BASE} element={<AdminKnowledgeBasePage />} />
                <Route path={AdminPath.TEST_SCRIPTS} element={<AdminTestScriptsPage />} />
                <Route path={AdminPath.CREATE_TICKET} element={<AdminCreateTicketPage />} />
                <Route
                  path={AdminPath.CREATE_TICKET_TYPE}
                  element={<AdminCreateTicketFormPage />}
                />
                <Route path={AdminPath.USER_MANAGEMENT} element={<AdminUserManagementPage />} />
                <Route path={AdminPath.ROLE_REQUESTS} element={<AdminRoleRequestsPage />} />
                <Route
                  path={AdminPath.CONSULTANT_PROFILE}
                  element={<AdminConsultantProfilePage />}
                />
                <Route path={AdminPath.PROFILE} element={<AdminProfilePage />} />
                <Route path={AdminPath.INCIDENT_DETAIL} element={<AdminIncidentDetailPage />} />
                <Route path={AdminPath.TICKET_DETAIL} element={<AdminTicketDetailPage />} />
                <Route
                  path={AdminPath.SUGGESTED_SOLUTION}
                  element={<AdminSuggestedSolutionPage />}
                />

                {/* User routes accessible to admin */}
                <Route path={UserPath.DASHBOARD} element={<UserDashboardPage />} />
                <Route path={UserPath.FAVOURITES} element={<UserFavouritesPage />} />
                <Route path={UserPath.RECENT_ITEMS} element={<UserRecentItemsPage />} />
                <Route
                  path={UserPath.INCIDENT_MANAGEMENT}
                  element={<UserIncidentManagementPage />}
                />
                <Route path={UserPath.CHANGE_MANAGEMENT} element={<UserChangeManagementPage />} />
                <Route path={UserPath.PROBLEM_MANAGEMENT} element={<UserProblemManagementPage />} />

                {/* Consultant routes accessible to admin */}
                <Route path={ConsultantPath.DASHBOARD} element={<ConsultantDashboardPage />} />
                <Route
                  path={ConsultantPath.CHANGE_MANAGEMENT}
                  element={<ConsultantChangeManagementPage />}
                />
                <Route
                  path={ConsultantPath.PROBLEM_MANAGEMENT}
                  element={<ConsultantProblemManagementPage />}
                />
                <Route
                  path={ConsultantPath.CREATE_TICKET}
                  element={<ConsultantCreateTicketPage />}
                />

                <Route path={Path.NOT_FOUND} element={<NotFoundPage />} />
              </Routes>
            </MainContent>
          )}
        </ErrorBoundary>
      </AppRoleContext.Provider>
    );
  }

  // Authenticated as Consultant — consultant layout + consultant routes + user routes
  if (isConsultant) {
    // Check which page consultant is viewing
    const isOnUserPage = location.pathname.startsWith('/app/user');

    const contextValue: 'consultant' | 'user' = isOnUserPage ? 'user' : 'consultant';

    return (
      <AppRoleContext.Provider value={contextValue}>
        <ErrorBoundary>
          {isOnUserPage ? (
            <>
              <UserHeaderPage />
              <UserSideNavPage />
            </>
          ) : (
            <>
              <ConsultantHeaderPage />
              <ConsultantSideNavPage />
            </>
          )}
          <MainContent>
            <Routes>
              {/* Redirect root to consultant dashboard */}
              <Route
                path={Path.DEFAULT_PAGE}
                element={<Navigate to={ConsultantPath.DASHBOARD} replace />}
              />

              {/* Consultant routes */}
              <Route path={ConsultantPath.DASHBOARD} element={<ConsultantDashboardPage />} />
              <Route
                path={ConsultantPath.CHANGE_MANAGEMENT}
                element={<ConsultantChangeManagementPage />}
              />
              <Route
                path={ConsultantPath.PROBLEM_MANAGEMENT}
                element={<ConsultantProblemManagementPage />}
              />
              <Route path={ConsultantPath.CREATE_TICKET} element={<ConsultantCreateTicketPage />} />

              {/* User routes accessible to consultant */}
              <Route path={UserPath.DASHBOARD} element={<UserDashboardPage />} />
              <Route path={UserPath.FAVOURITES} element={<UserFavouritesPage />} />
              <Route path={UserPath.RECENT_ITEMS} element={<UserRecentItemsPage />} />
              <Route path={UserPath.INCIDENT_MANAGEMENT} element={<UserIncidentManagementPage />} />
              <Route path={UserPath.CHANGE_MANAGEMENT} element={<UserChangeManagementPage />} />
              <Route path={UserPath.PROBLEM_MANAGEMENT} element={<UserProblemManagementPage />} />

              {/* Redirect /app/admin/* to consultant dashboard */}
              <Route
                path={DefalutPage.ADMIN_DEFAULT_PAGE}
                element={<Navigate to={ConsultantPath.DASHBOARD} replace />}
              />

              <Route path={Path.NOT_FOUND} element={<NotFoundPage />} />
            </Routes>
          </MainContent>
        </ErrorBoundary>
      </AppRoleContext.Provider>
    );
  }

  // Authenticated as User — user layout + user routes
  return (
    <AppRoleContext.Provider value='user'>
      <ErrorBoundary>
        <UserHeaderPage />
        <UserSideNavPage />
        <MainContent>
          <Routes>
            {/* Redirect root to user dashboard */}
            <Route
              path={Path.DEFAULT_PAGE}
              element={<Navigate to={UserPath.DASHBOARD} replace />}
            />

            {/* User routes */}
            <Route path={UserPath.DASHBOARD} element={<UserDashboardPage />} />
            <Route path={UserPath.FAVOURITES} element={<UserFavouritesPage />} />
            <Route path={UserPath.RECENT_ITEMS} element={<UserRecentItemsPage />} />
            <Route path={UserPath.INCIDENT_MANAGEMENT} element={<UserIncidentManagementPage />} />
            <Route path={UserPath.CHANGE_MANAGEMENT} element={<UserChangeManagementPage />} />
            <Route path={UserPath.PROBLEM_MANAGEMENT} element={<UserProblemManagementPage />} />

            {/* Redirect /app/admin/* and /app/consultant/* to user dashboard */}
            <Route
              path={DefalutPage.ADMIN_DEFAULT_PAGE}
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
