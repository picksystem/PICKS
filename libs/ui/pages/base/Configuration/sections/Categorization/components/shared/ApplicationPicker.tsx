import { Box, Typography, Select, MenuItem } from '@serviceops/component';
import { alpha, FormControl } from '@mui/material';
import { IConfigApplication } from '@serviceops/interfaces';

export const ApplicationPicker = ({
  accent,
  applications,
  value,
  onChange,
}: {
  accent: string;
  applications: IConfigApplication[];
  value: string;
  onChange: (id: string) => void;
}) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      bgcolor: alpha(accent, 0.04),
      border: '1px solid',
      borderColor: alpha(accent, 0.2),
      borderTop: 'none',
      borderBottom: 'none',
    }}
  >
    <Typography
      variant='caption'
      fontWeight={600}
      color='text.secondary'
      sx={{ whiteSpace: 'nowrap' }}
    >
      Application:
    </Typography>
    <FormControl size='small' sx={{ minWidth: 260 }}>
      <Select
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ fontSize: '0.82rem', '& .MuiSelect-select': { py: 0.6 } }}
        renderValue={(v) => {
          if (!v)
            return (
              <Typography component='span' sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>
                — select an application —
              </Typography>
            );
          return applications.find((a) => a.id === v)?.name ?? v;
        }}
      >
        {applications.length === 0 ? (
          <MenuItem disabled value=''>
            <em>No applications available</em>
          </MenuItem>
        ) : (
          applications.map((app) => (
            <MenuItem key={app.id} value={app.id} sx={{ fontSize: '0.82rem' }}>
              {app.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  </Box>
);
