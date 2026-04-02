import { lazy } from 'react';

// Lazy-loaded pages
export const LazyMenuItems = {
  // Admin pages
  AdminDashboardPage: lazy(() => import('@serviceops/pages/admin/Dashboard')),
  AdminFavouritesPage: lazy(() => import('@serviceops/pages/admin/Favourites')),
  AdminRecentItemsPage: lazy(() => import('@serviceops/pages/admin/RecentItems')),
  AdminIncidentManagementPage: lazy(() => import('@serviceops/pages/admin/IncidentManagement')),
  AdminChangeManagementPage: lazy(() => import('@serviceops/pages/admin/ChangeManagement')),
  AdminProblemManagementPage: lazy(() => import('@serviceops/pages/admin/ProblemManagement')),
  AdminTimeManagementPage: lazy(() => import('@serviceops/pages/admin/TimeManagement')),
  AdminReportsPage: lazy(() => import('@serviceops/pages/admin/Reports')),
  AdminTicketTemplatesPage: lazy(() => import('@serviceops/pages/admin/TicketTemplates')),
  AdminCabRequestPage: lazy(() => import('@serviceops/pages/admin/CabRequest')),
  AdminKnowledgeBasePage: lazy(() => import('@serviceops/pages/admin/KnowledgeBase')),
  AdminTestScriptsPage: lazy(() => import('@serviceops/pages/admin/TestScripts')),
  AdminCreateTicketPage: lazy(() => import('@serviceops/pages/admin/CreateTicket')),
  AdminCreateTicketFormPage: lazy(() => import('@serviceops/pages/admin/CreateTicket/CreateTicketForm')),
  AdminUserManagementPage: lazy(() => import('@serviceops/pages/admin/UserManagement')),
  AdminRoleRequestsPage: lazy(() => import('@serviceops/pages/admin/RoleRequests')),
  AdminConsultantProfilePage: lazy(() => import('@serviceops/pages/admin/ConsultantProfile')),
  AdminProfilePage: lazy(() => import('@serviceops/pages/admin/Profile')),
  AdminIncidentDetailPage: lazy(() => import('@serviceops/pages/admin/IncidentDetail')),
  AdminTicketDetailPage: lazy(() => import('@serviceops/pages/admin/TicketDetail')),
  AdminSuggestedSolutionPage: lazy(() => import('@serviceops/pages/admin/SuggestedSolution')),
  AdminConfigurationPage: lazy(() => import('@serviceops/pages/admin/Configuration')),

  // Admin layout
  AdminHeaderPage: lazy(() => import('@serviceops/pages/admin/Header')),
  AdminSideNavPage: lazy(() => import('@serviceops/pages/admin/SideNav')),

  // User pages
  UserDashboardPage: lazy(() => import('@serviceops/pages/user/Dashboard')),
  UserFavouritesPage: lazy(() => import('@serviceops/pages/user/Favourites')),
  UserRecentItemsPage: lazy(() => import('@serviceops/pages/user/RecentItems')),
  UserIncidentManagementPage: lazy(() => import('@serviceops/pages/user/IncidentManagement')),
  UserChangeManagementPage: lazy(() => import('@serviceops/pages/user/ChangeManagement')),
  UserProblemManagementPage: lazy(() => import('@serviceops/pages/user/ProblemManagement')),

  // User layout
  UserHeaderPage: lazy(() => import('@serviceops/pages/user/Header')),
  UserSideNavPage: lazy(() => import('@serviceops/pages/user/SideNav')),

  // Consultant pages
  ConsultantDashboardPage: lazy(() => import('@serviceops/pages/consultant/Dashboard')),
  ConsultantChangeManagementPage: lazy(() => import('@serviceops/pages/consultant/ChangeManagement')),
  ConsultantProblemManagementPage: lazy(() => import('@serviceops/pages/consultant/ProblemManagement')),
  ConsultantCreateTicketPage: lazy(() => import('@serviceops/pages/consultant/CreateTicket')),

  // Consultant layout
  ConsultantHeaderPage: lazy(() => import('@serviceops/pages/consultant/Header')),
  ConsultantSideNavPage: lazy(() => import('@serviceops/pages/consultant/SideNav')),

  // Auth pages (shared/public)
  SignInPage: lazy(() => import('@serviceops/pages/shared/SignIn')),
  SignUpPage: lazy(() => import('@serviceops/pages/shared/SignUp')),
  ForgotPasswordPage: lazy(() => import('@serviceops/pages/shared/ForgotPassword')),

  // NotFound page (shared component)
  NotFoundPage: lazy(() => import('../../../../../libs/ui/components/NotFound')),
};
