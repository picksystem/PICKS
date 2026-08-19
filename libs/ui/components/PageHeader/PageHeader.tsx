import { Box, Typography, Button } from '@serviceops/component';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageHeaderProps } from './PageHeader.types';

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  icon,
  sx,
  titleSx,
  descriptionSx,
  className,
  titleClassName,
  descriptionClassName,
  iconClassName,
}) => {
  return (
    <Box className={className} sx={sx}>
      <Box className='pageHeaderRow'>
        {icon && (
          <Box
            className={`pageHeaderIcon${iconClassName ? ` ${iconClassName}` : ''}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#fff',
              fontSize: '22px',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
            }}
          >
            {icon}
          </Box>
        )}
        <Box className='pageHeaderText'>
          <Typography
            variant='h6'
            className={titleClassName}
            sx={{
              fontWeight: 800,
              color: '#1e293b',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              ...titleSx,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant='body2'
              className={descriptionClassName}
              sx={{
                fontWeight: 400,
                color: '#64748b',
                marginTop: '2px',
                lineHeight: 1.5,
                ...descriptionSx,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
        {action && (
          <Button
            variant='outlined'
            size='small'
            startIcon={action.icon || <RefreshIcon />}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
