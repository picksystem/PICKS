import { Box, Typography, FormControlLabel, Checkbox, Tooltip, Link } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useDevice } from '@picks/hooks';

interface TicketTypeToolbarProps {
  advancedSequences: boolean;
  onAdvancedSequencesChange: (v: boolean) => void;
}

const TicketTypeToolbar = ({
  advancedSequences,
  onAdvancedSequencesChange,
}: TicketTypeToolbarProps) => {
  const { isXS, isSM } = useDevice();
  const isMobile = isXS || isSM;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, flexWrap: 'wrap' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={advancedSequences}
            onChange={(e) => onAdvancedSequencesChange(e.target.checked)}
            size='small'
            color='primary'
          />
        }
        label={
          <Typography variant='body2' fontWeight={500} fontSize={isMobile ? '0.8rem' : undefined}>
            {isMobile ? 'Advanced Sequences' : 'Use Advanced Number Sequences'}
          </Typography>
        }
        sx={{ mr: 0 }}
      />
      <Tooltip title='Opens documentation in a new tab' placement='top'>
        <Link
          href='#'
          underline='hover'
          onClick={(e) => e.preventDefault()}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem' }}
        >
          How numbering works
          <OpenInNewIcon sx={{ fontSize: '0.8rem' }} />
        </Link>
      </Tooltip>
    </Box>
  );
};

export default TicketTypeToolbar;
