import { Box, Typography, Button } from '@serviceops/component';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageHeaderProps } from './util';

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  sx,
  titleSx,
  descriptionSx,
  className,
  titleClassName,
}) => {
  return (
    <Box className={className} sx={sx}>
      <Box className='pageHeaderRow'>
        <Typography variant='h5' className={titleClassName} sx={titleSx}>
          {title}
        </Typography>
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
      {description && (
        <Typography variant='body2' sx={descriptionSx}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
