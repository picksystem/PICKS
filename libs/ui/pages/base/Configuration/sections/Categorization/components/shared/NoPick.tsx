import { Box, Typography } from '@mui/material';

export const NoPick = ({ text }: { text: string }) => (
  <Box
    sx={{
      py: 6,
      textAlign: 'center',
      border: '1px solid',
      borderTop: 'none',
      borderColor: 'divider',
      borderRadius: '0 0 10px 10px',
      bgcolor: 'grey.50',
    }}
  >
    <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
      {text}
    </Typography>
  </Box>
);
