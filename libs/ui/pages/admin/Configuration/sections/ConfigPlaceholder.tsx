import { Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface ConfigPlaceholderProps {
  title: string;
  description: string;
  Icon: SvgIconComponent;
  accentColor?: string;
}

const ConfigPlaceholder = ({
  title,
  description,
  Icon,
  accentColor = '#2563eb',
}: ConfigPlaceholderProps) => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    {/* Section header */}
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
      <Box
        sx={{
          width: { xs: 34, sm: 40 },
          height: { xs: 34, sm: 40 },
          borderRadius: 2,
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}bb 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        <Icon sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.2rem' } }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant='h6'
          fontWeight={700}
          color='text.primary'
          lineHeight={1.2}
          sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
        >
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
          {description}
        </Typography>
      </Box>
    </Box>

    {/* Coming soon placeholder */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 5, sm: 10 },
        gap: { xs: 1.5, sm: 2 },
        bgcolor: 'grey.50',
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: { xs: 52, sm: 64 },
          height: { xs: 52, sm: 64 },
          borderRadius: '50%',
          bgcolor: `${accentColor}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, color: accentColor, opacity: 0.7 }} />
      </Box>
      <Typography
        variant='h6'
        color='text.secondary'
        fontWeight={600}
        sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
      >
        {title}
      </Typography>
      <Typography
        variant='body2'
        color='text.disabled'
        textAlign='center'
        sx={{ maxWidth: { xs: '100%', sm: 340 }, px: { xs: 1, sm: 0 } }}
      >
        This configuration section is under development. Settings will appear here once available.
      </Typography>
    </Box>
  </Box>
);

export default ConfigPlaceholder;
