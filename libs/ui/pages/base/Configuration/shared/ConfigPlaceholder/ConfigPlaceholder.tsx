import { Box, Typography } from '@serviceops/component';
import type { ConfigPlaceholderProps } from './ConfigPlaceholder.tsx.util';
import { getPlaceholderStyles } from './ConfigPlaceholder.styles';

const ConfigPlaceholder = ({
  title,
  description,
  Icon,
  accentColor = '#2563eb',
}: ConfigPlaceholderProps) => {
  const styles = getPlaceholderStyles(accentColor);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Box sx={styles.iconBadge}>
          <Icon sx={styles.icon} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='h6' fontWeight={700} color='text.primary' lineHeight={1.2} sx={styles.titleText}>
            {title}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={styles.descriptionText}>
            {description}
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.placeholderBox}>
        <Box sx={styles.placeholderIconCircle}>
          <Icon sx={styles.placeholderIcon} />
        </Box>
        <Typography variant='h6' color='text.secondary' fontWeight={600} sx={styles.placeholderTitle}>
          {title}
        </Typography>
        <Typography variant='body2' color='text.disabled' textAlign='center' sx={styles.placeholderDescription}>
          This configuration section is under development. Settings will appear here once available.
        </Typography>
      </Box>
    </Box>
  );
};

export default ConfigPlaceholder;
