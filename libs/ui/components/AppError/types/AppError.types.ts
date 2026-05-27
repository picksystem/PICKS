export interface AppErrorProps {
  code?: number | 'ERROR' | 'LOADING';
  title?: string;
  message?: string;
  description?: string;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
  showGoBackButton?: boolean;
  onHomeClick?: () => void;
  onReloadClick?: () => void;
  onGoBackClick?: () => void;
}

export const ERROR_CONFIG: Record<number | string, AppErrorProps> = {
  400: {
    code: 400,
    title: 'Bad Request',
    message: 'Invalid Request',
    description:
      'The request you made was invalid or malformed. Please check your input and try again.',
    showGoBackButton: true,
  },
  401: {
    code: 401,
    title: 'Unauthorized',
    message: 'Access Denied',
    description:
      'You are not authorized to view this page. Please sign in or contact your administrator.',
    showHomeButton: true,
  },
  403: {
    code: 403,
    title: 'Forbidden',
    message: 'Access Forbidden',
    description:
      'You do not have permission to access this resource. Contact your administrator for assistance.',
    showHomeButton: true,
  },
  404: {
    code: 404,
    title: 'Not Found',
    message: 'Page Not Found',
    description:
      'The page you are looking for does not exist or has been moved. Please check the URL or navigate home.',
    showHomeButton: true,
  },
  500: {
    code: 500,
    title: 'Internal Server Error',
    message: 'Server Error',
    description:
      'Something went wrong on our end. We are working to fix this issue. Please try again later.',
    showHomeButton: true,
    showReloadButton: true,
  },
  502: {
    code: 502,
    title: 'Bad Gateway',
    message: 'Service Unavailable',
    description: 'The server received an invalid response. Please try again later.',
    showHomeButton: true,
    showReloadButton: true,
  },
  503: {
    code: 503,
    title: 'Service Unavailable',
    message: 'Temporarily Unavailable',
    description: 'The service is currently unavailable. Please try again in a few moments.',
    showHomeButton: true,
    showReloadButton: true,
  },
  ERROR: {
    code: 'ERROR',
    title: 'Something Went Wrong',
    message: 'Unexpected Error',
    description:
      'An unexpected error occurred. Please try again or contact support if the problem persists.',
    showHomeButton: true,
    showReloadButton: true,
  },
  LOADING: {
    code: 'LOADING',
    title: 'Loading',
    message: 'Please Wait',
    description: 'Loading your content...',
  },
} as const;
