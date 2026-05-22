import React from 'react';
import { Box, Typography, IconButton } from '@serviceops/component';
import { alpha } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DayMeta } from './types';

interface DayCardProps {
  day: DayMeta;
  hours: number;
  onChange: (v: number) => void;
}

const DayCard = ({ day, hours, onChange }: DayCardProps) => {
  const fillPct = Math.min(100, (hours / 12) * 100);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        borderRadius: 2.5,
        border: '1.5px solid',
        borderColor: hours > 0 ? alpha(day.color, 0.35) : alpha('#000', 0.08),
        bgcolor: hours > 0 ? alpha(day.color, 0.04) : 'grey.50',
        transition: 'all 0.2s ease',
        minWidth: 0,
        flex: 1,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: hours > 0 ? day.color : alpha('#000', 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          boxShadow: hours > 0 ? `0 4px 12px ${alpha(day.color, 0.4)}` : 'none',
        }}
      >
        <Typography
          sx={{
            color: hours > 0 ? '#fff' : 'text.disabled',
            fontWeight: 800,
            fontSize: '0.85rem',
            lineHeight: 1,
          }}
        >
          {day.letter}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: hours > 0 ? day.color : 'text.disabled',
        }}
      >
        {day.short}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <IconButton
          size='small'
          onClick={() => onChange(Math.max(0, hours - 1))}
          sx={{
            p: 0.25,
            color: hours > 0 ? day.color : 'text.disabled',
            '&:hover': { bgcolor: alpha(day.color, 0.1) },
          }}
        >
          <RemoveCircleOutlineIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <Typography
          sx={{
            width: 28,
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: hours > 0 ? day.color : 'text.disabled',
            lineHeight: 1,
          }}
        >
          {hours}
        </Typography>
        <IconButton
          size='small'
          onClick={() => onChange(Math.min(24, hours + 1))}
          sx={{
            p: 0.25,
            color: day.color,
            '&:hover': { bgcolor: alpha(day.color, 0.1) },
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600 }}>
        hrs
      </Typography>

      <Box
        sx={{
          width: '100%',
          height: 3,
          bgcolor: alpha('#000', 0.06),
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${fillPct}%`,
            bgcolor: hours > 0 ? day.color : 'transparent',
            borderRadius: 2,
            transition: 'width 0.25s ease',
          }}
        />
      </Box>
    </Box>
  );
};

export { DayCard };
