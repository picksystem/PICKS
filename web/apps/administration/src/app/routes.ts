import { lazy } from 'react';

// Lazy-loaded pages
export const LazyMenuItems = {
  // Admin pages
  AdminDashboardPage: lazy(() => import('@picks/pages/admin/Dashboard')),
  AdminFavouritesPage: lazy(() => import('@picks/pages/admin/Favourites')),
  AdminRecentItemsPage: lazy(() => import('@picks/pages/admin/RecentItems')),
  AdminIncidentManagementPage: lazy(() => import('@picks/pages/admin/IncidentManagement')),
  AdminChangeManagementPage: lazy(() => import('@picks/pages/admin/ChangeManagement')),
  AdminProblemManagementPage: lazy(() => import('@picks/pages/admin/ProblemManagement')),
  AdminTimeManagementPage: lazy(() => import('@picks/pages/admin/TimeManagement')),
  AdminReportsPage: lazy(() => import('@picks/pages/admin/Reports')),
  AdminTicketTemplatesPage: lazy(() => import('@picks/pages/admin/TicketTemplates')),
  AdminCabRequestPage: lazy(() => import('@picks/pages/admin/CabRequest')),
  AdminKnowledgeBasePage: lazy(() => import('@picks/pages/admin/KnowledgeBase')),
  AdminTestScriptsPage: lazy(() => import('@picks/pages/admin/TestScripts')),
  AdminCreateTicketPage: lazy(() => import('@picks/pages/admin/CreateTicket')),
  AdminCreateTicketFormPage: lazy(() => import('@picks/pages/admin/CreateTicket/CreateTicketForm')),
  AdminUserManagementPage: lazy(() => import('@picks/pages/admin/UserManagement')),
  AdminRoleRequestsPage: lazy(() => import('@picks/pages/admin/RoleRequests')),
  AdminConsultantProfilePage: lazy(() => import('@picks/pages/admin/ConsultantProfile')),
  AdminProfilePage: lazy(() => import('@picks/pages/admin/Profile')),
  AdminIncidentDetailPage: lazy(() => import('@picks/pages/admin/IncidentDetail')),
  AdminTicketDetailPage: lazy(() => import('@picks/pages/admin/TicketDetail')),
  AdminSuggestedSolutionPage: lazy(() => import('@picks/pages/admin/SuggestedSolution')),
  AdminConfigurationPage: lazy(() => import('@picks/pages/admin/Configuration')),

  // Admin layout
  AdminHeaderPage: lazy(() => import('@picks/pages/admin/Header')),
  AdminSideNavPage: lazy(() => import('@picks/pages/admin/SideNav')),

  // User pages
  UserDashboardPage: lazy(() => import('@picks/pages/user/Dashboard')),
  UserFavouritesPage: lazy(() => import('@picks/pages/user/Favourites')),
  UserRecentItemsPage: lazy(() => import('@picks/pages/user/RecentItems')),
  UserIncidentManagementPage: lazy(() => import('@picks/pages/user/IncidentManagement')),
  UserChangeManagementPage: lazy(() => import('@picks/pages/user/ChangeManagement')),
  UserProblemManagementPage: lazy(() => import('@picks/pages/user/ProblemManagement')),

  // User layout
  UserHeaderPage: lazy(() => import('@picks/pages/user/Header')),
  UserSideNavPage: lazy(() => import('@picks/pages/user/SideNav')),

  // Consultant pages
  ConsultantDashboardPage: lazy(() => import('@picks/pages/consultant/Dashboard')),
  ConsultantChangeManagementPage: lazy(() => import('@picks/pages/consultant/ChangeManagement')),
  ConsultantProblemManagementPage: lazy(() => import('@picks/pages/consultant/ProblemManagement')),
  ConsultantCreateTicketPage: lazy(() => import('@picks/pages/consultant/CreateTicket')),

  // Consultant layout
  ConsultantHeaderPage: lazy(() => import('@picks/pages/consultant/Header')),
  ConsultantSideNavPage: lazy(() => import('@picks/pages/consultant/SideNav')),

  // Auth pages (shared/public)
  SignInPage: lazy(() => import('@picks/pages/shared/SignIn')),
  SignUpPage: lazy(() => import('@picks/pages/shared/SignUp')),
  ForgotPasswordPage: lazy(() => import('@picks/pages/shared/ForgotPassword')),

  // NotFound page (shared component)
  NotFoundPage: lazy(() => import('../../../../../libs/ui/components/NotFound')),
};
