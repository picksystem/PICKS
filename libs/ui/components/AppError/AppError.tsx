import { FC, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ConstructionIcon from '@mui/icons-material/Construction';
import type { AppErrorProps } from './types/AppError.types';

interface AppErrorComponentProps extends AppErrorProps {
  icon?: ReactNode;
}

const AppError: FC<AppErrorComponentProps> = ({
  code,
  title,
  message,
  description,
  showHomeButton = true,
  showReloadButton = false,
  showGoBackButton = false,
  onHomeClick,
  onReloadClick,
  onGoBackClick,
  icon,
}) => {
  const handleHome = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.location.href = '/';
    }
  };

  const handleReload = () => {
    if (onReloadClick) {
      onReloadClick();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (onGoBackClick) {
      onGoBackClick();
    } else {
      window.history.back();
    }
  };

  const getDefaultIcon = (): ReactNode => {
    if (typeof code === 'number') {
      switch (code) {
        case 400:
          return <ErrorOutlineIcon sx={{ fontSize: 80, color: 'warning.main' }} />;
        case 401:
        case 403:
          return <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />;
        case 404:
          return <SearchOffIcon sx={{ fontSize: 80, color: 'grey.400' }} />;
        case 500:
        case 502:
        case 503:
          return <ConstructionIcon sx={{ fontSize: 80, color: 'error.main' }} />;
        default:
          return <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />;
      }
    }
    if (code === 'ERROR') {
      return <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />;
    }
    if (code === 'LOADING') {
      return <DashboardIcon sx={{ fontSize: 80, color: 'primary.main' }} />;
    }
    return <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 4,
      }}
    >
      <Container maxWidth='sm'>
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Box sx={{ mb: 3 }}>{icon || getDefaultIcon()}</Box>

          {code && (
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: '4rem', sm: '6rem' },
                fontWeight: 800,
                color: 'grey.200',
                lineHeight: 1,
                mb: 2,
              }}
            >
              {code}
            </Typography>
          )}

          {title && (
            <Typography
              variant='overline'
              sx={{
                color: 'primary.main',
                letterSpacing: 2,
                fontWeight: 600,
                display: 'block',
                mb: 1,
              }}
            >
              {title}
            </Typography>
          )}

          {message && (
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
              }}
            >
              {message}
            </Typography>
          )}

          {description && (
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
            >
              {description}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {showHomeButton && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<HomeOutlinedIcon />}
                onClick={handleHome}
              >
                Go Home
              </Button>
            )}

            {showReloadButton && (
              <Button
                variant='outlined'
                color='primary'
                startIcon={<RefreshIcon />}
                onClick={handleReload}
              >
                Reload Page
              </Button>
            )}

            {showGoBackButton && (
              <Button
                variant='outlined'
                color='inherit'
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
              >
                Go Back
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AppError;
