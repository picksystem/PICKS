import { Box, Typography } from '@serviceops/component';
import type { ConfigPlaceholderProps } from './ConfigPlaceholder.tsx.util';
import { useStyles } from './styles';

const ConfigPlaceholder = ({
  title,
  description,
  Icon,
  accentColor = '#2563eb',
}: ConfigPlaceholderProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Box className={classes.iconBadge}>
          <Icon className={classes.icon} sx={{ color: accentColor }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant='h6'
            fontWeight={700}
            color='text.primary'
            lineHeight={1.2}
            className={classes.titleText}
          >
            {title}
          </Typography>
          <Typography variant='body2' color='text.secondary' className={classes.descriptionText}>
            {description}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.placeholderBox}>
        <Box className={classes.placeholderIconCircle}>
          <Icon className={classes.placeholderIcon} sx={{ color: accentColor }} />
        </Box>
        <Typography
          variant='h6'
          color='text.secondary'
          fontWeight={600}
          className={classes.placeholderTitle}
        >
          {title}
        </Typography>
        <Typography
          variant='body2'
          color='text.disabled'
          textAlign='center'
          className={classes.placeholderDescription}
        >
          This configuration section is under development. Settings will appear here once available.
        </Typography>
      </Box>
    </Box>
  );
};

export default ConfigPlaceholder;
