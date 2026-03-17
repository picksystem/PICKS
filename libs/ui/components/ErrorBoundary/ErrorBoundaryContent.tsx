import { FC, ErrorInfo } from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { useStyles } from './styles';

interface ErrorBoundaryContentProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
}

export const ErrorBoundaryContent: FC<ErrorBoundaryContentProps> = ({
  error,
  errorInfo,
  onReset,
  onReload,
}) => {
  const { classes } = useStyles();

  return (
    <Container maxWidth='md' className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <ErrorOutline className={classes.errorIcon} />
        <Typography variant='h4' gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          We're sorry for the inconvenience. An unexpected error has occurred.
        </Typography>

        {process.env.NODE_ENV === 'development' && error && (
          <Box className={classes.errorDetailsBox}>
            <Typography variant='subtitle2' color='error' gutterBottom>
              Error Details (Development Only):
            </Typography>
            <Typography variant='body2' component='pre' className={classes.errorText}>
              {error.toString()}
              {errorInfo && (
                <>
                  {'\n\n'}
                  {errorInfo.componentStack}
                </>
              )}
            </Typography>
          </Box>
        )}

        <Box className={classes.buttonContainer}>
          <Button variant='contained' color='primary' onClick={onReset}>
            Try Again
          </Button>
          <Button variant='outlined' color='primary' onClick={onReload}>
            Reload Page
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
