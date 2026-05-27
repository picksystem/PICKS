import AppError from './AppError';
import { ERROR_CONFIG } from './types/AppError.types';

export const BadRequestError = () => <AppError {...ERROR_CONFIG[400]} />;

export const UnauthorizedError = () => <AppError {...ERROR_CONFIG[401]} />;

export const ForbiddenError = () => <AppError {...ERROR_CONFIG[403]} />;

export const NotFoundError = () => <AppError {...ERROR_CONFIG[404]} />;

export const ServerError = () => <AppError {...ERROR_CONFIG[500]} />;

export const ServiceUnavailableError = () => <AppError {...ERROR_CONFIG[503]} />;

export const GenericError = (props?: Partial<typeof ERROR_CONFIG.ERROR>) => (
  <AppError {...ERROR_CONFIG.ERROR} {...props} />
);

export default AppError;
