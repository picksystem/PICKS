import { Typography } from '@mui/material';
import { Box } from '@serviceops/component';

interface LogoMarkProps {
  compact?: boolean;
}

// Colorful ServiceOps wordmark: each letter has its own vibrant color
const LETTERS = [
  { char: 'S', color: '#fb7185' }, // rose
  { char: 'e', color: '#fbbf24' }, // amber
  { char: 'r', color: '#34d399' }, // emerald
  { char: 'v', color: '#60a5fa' }, // sky blue
  { char: 'i', color: '#c084fc' }, // violet
  { char: 'c', color: '#f472b6' }, // pink
  { char: 'e', color: '#38bdf8' }, // light blue
  { char: 'O', color: '#fb923c' }, // orange
  { char: 'p', color: '#a3e635' }, // lime
  { char: 's', color: '#e879f9' }, // fuchsia
];

const LogoMark = ({ compact = false }: LogoMarkProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.875 : 1.25, flexShrink: 0 }}>
    {/* Icon badge — multi-tone gradient matching the letter colors */}
    <Box
      sx={{
        width: compact ? 30 : 40,
        height: compact ? 30 : 40,
        borderRadius: compact ? '8px' : '11px',
        background: 'linear-gradient(145deg, #6d28d9 0%, #2563eb 35%, #059669 70%, #d97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow:
          '0 0 0 1.5px rgba(255,255,255,0.22), 0 4px 18px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      {/* Top shine */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '48%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
          borderRadius: compact ? '8px 8px 0 0' : '11px 11px 0 0',
          zIndex: 0,
        }}
      />
      {/* Shield + checkmark SVG */}
      <svg
        width={compact ? 16 : 22}
        height={compact ? 16 : 22}
        viewBox='0 0 24 24'
        fill='none'
        style={{
          position: 'relative',
          zIndex: 1,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
        }}
      >
        <path
          d='M12 2.5L4.5 6V11.5C4.5 16.5 7.7 21.1 12 22.5C16.3 21.1 19.5 16.5 19.5 11.5V6L12 2.5Z'
          fill='rgba(255,255,255,0.2)'
          stroke='white'
          strokeWidth='1.4'
          strokeLinejoin='round'
        />
        <path
          d='M8.5 12.5L11 15L15.5 10'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Box>

    {/* Wordmark — each letter its own color */}
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        {LETTERS.map(({ char, color }, idx) => (
          <Typography
            key={idx}
            component='span'
            sx={{
              color,
              fontWeight: 900,
              fontSize: compact ? '0.85rem' : '1.1rem',
              lineHeight: 1,
              letterSpacing: '0.02em',
              textShadow: `0 0 10px ${color}66, 0 1px 3px rgba(0,0,0,0.2)`,
              fontFamily: '"Segoe UI Black","Segoe UI","Helvetica Neue",Arial,sans-serif',
            }}
          >
            {char}
          </Typography>
        ))}
      </Box>
      {!compact && (
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.42rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            fontWeight: 700,
            lineHeight: 1,
            marginTop: '4px',
          }}
        >
          IT Service Platform
        </Typography>
      )}
    </Box>
  </Box>
);

export default LogoMark;
