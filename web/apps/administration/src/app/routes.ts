import { lazy } from 'react';

// Lazy-loaded pages
export const LazyMenuItems = {
  // Base pages (shared for admin, user, consultant)
  BaseDashboardPage: lazy(() => import('@serviceops/pages/base/Dashboard')),
  BaseFavouritesPage: lazy(() => import('@serviceops/pages/base/Favourites')),
  BaseRecentItemsPage: lazy(() => import('@serviceops/pages/base/RecentItems')),
  BaseIncidentManagementPage: lazy(() => import('@serviceops/pages/base/IncidentManagement')),
  BaseTicketManagementPage: lazy(() => import('@serviceops/pages/base/TicketManagement')),
  BaseChangeManagementPage: lazy(() => import('@serviceops/pages/base/ChangeManagement')),
  BaseProblemManagementPage: lazy(() => import('@serviceops/pages/base/ProblemManagement')),
  BaseTimeManagementPage: lazy(() => import('@serviceops/pages/base/TimeManagement')),
  BaseReportsPage: lazy(() => import('@serviceops/pages/base/Reports')),
  BaseTicketTypesConfigPage: lazy(() => import('@serviceops/pages/base/TicketTypesConfig')),
  BaseCabRequestPage: lazy(() => import('@serviceops/pages/base/CabRequest')),
  BaseKnowledgeBasePage: lazy(() => import('@serviceops/pages/base/KnowledgeBase')),
  BaseTestScriptsPage: lazy(() => import('@serviceops/pages/base/TestScripts')),
  BaseCreateTicketPage: lazy(() => import('@serviceops/pages/base/CreateTicket')),
  BaseCreateTicketFormPage: lazy(
    () => import('@serviceops/pages/base/CreateTicket/CreateTicketForm'),
  ),
  BaseUserManagementPage: lazy(() => import('@serviceops/pages/base/UserManagement')),
  BaseClientsAndProjectsPage: lazy(() => import('@serviceops/pages/base/ClientsAndProjects')),
  BaseRoleRequestsPage: lazy(() => import('@serviceops/pages/base/RoleRequests')),
  BaseProfilePage: lazy(() => import('@serviceops/pages/base/Profile')),
  // Both routes render the same unified ticket detail page — one component
  // maintains every ticket type, no per-type duplication.
  BaseIncidentDetailPage: lazy(() => import('@serviceops/pages/base/TicketDetail')),
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
