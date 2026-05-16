import { lazy } from 'react';

// Lazy-loaded pages
export const LazyMenuItems = {
  // Base pages (shared for admin, user, consultant)
  BaseDashboardPage: lazy(() => import('@serviceops/pages/base/Dashboard')),
  BaseFavouritesPage: lazy(() => import('@serviceops/pages/base/Favourites')),
  BaseRecentItemsPage: lazy(() => import('@serviceops/pages/base/RecentItems')),
  BaseIncidentManagementPage: lazy(() => import('@serviceops/pages/base/IncidentManagement')),
  BaseChangeManagementPage: lazy(() => import('@serviceops/pages/base/ChangeManagement')),
  BaseProblemManagementPage: lazy(() => import('@serviceops/pages/base/ProblemManagement')),
  BaseTimeManagementPage: lazy(() => import('@serviceops/pages/base/TimeManagement')),
  BaseReportsPage: lazy(() => import('@serviceops/pages/base/Reports')),
  BaseTicketTemplatesPage: lazy(() => import('@serviceops/pages/base/TicketTemplates')),
  BaseCabRequestPage: lazy(() => import('@serviceops/pages/base/CabRequest')),
  BaseKnowledgeBasePage: lazy(() => import('@serviceops/pages/base/KnowledgeBase')),
  BaseTestScriptsPage: lazy(() => import('@serviceops/pages/base/TestScripts')),
  BaseCreateTicketPage: lazy(() => import('@serviceops/pages/base/CreateTicket')),
  BaseCreateTicketFormPage: lazy(
    () => import('@serviceops/pages/base/CreateTicket/CreateTicketForm'),
  ),
  BaseUserManagementPage: lazy(() => import('@serviceops/pages/base/UserManagement')),
  BaseRoleRequestsPage: lazy(() => import('@serviceops/pages/base/RoleRequests')),
  BaseConsultantProfilePage: lazy(() => import('@serviceops/pages/base/ConsultantProfile')),
  BaseProfilePage: lazy(() => import('@serviceops/pages/base/Profile')),
  BaseIncidentDetailPage: lazy(() => import('@serviceops/pages/base/IncidentDetail')),
  BaseTicketDetailPage: lazy(() => import('@serviceops/pages/base/TicketDetail')),
  BaseSuggestedSolutionPage: lazy(() => import('@serviceops/pages/base/SuggestedSolution')),
  BaseConfigurationPage: lazy(() => import('@serviceops/pages/base/Configuration')),

  // Base layout
  BaseHeaderPage: lazy(() => import('@serviceops/pages/base/Header')),
  BaseSideNavPage: lazy(() => import('@serviceops/pages/base/SideNav')),

  // Auth pages (shared/public)
  SignInPage: lazy(() => import('@serviceops/pages/shared/SignIn')),
  SignUpPage: lazy(() => import('@serviceops/pages/shared/SignUp')),
  ForgotPasswordPage: lazy(() => import('@serviceops/pages/shared/ForgotPassword')),

  // NotFound page (shared component)
  NotFoundPage: lazy(() => import('../../../../../libs/ui/components/NotFound')),
};
