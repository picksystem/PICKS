import { Typography } from '@mui/material';
import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Box, TextField } from '@picks/component';
import { useStyles } from '../styles';

interface InputColumnProps {
  shortDesc: string;
  issueText: string;
  onShortDescChange: (val: string) => void;
  onIssueTextChange: (val: string) => void;
}

const InputColumn = ({
  shortDesc,
  issueText,
  onShortDescChange,
  onIssueTextChange,
}: InputColumnProps) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.leftColumn}>
      {/* Short Description card */}
      <Box className={classes.inputCard} sx={{ mb: 2.5 }}>
        <Box className={classes.inputCardHeader}>
          <Box className={`${classes.inputCardIconBadge} ${classes.iconBadgeIndigo}`}>
            <SubjectIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
          <Typography className={classes.inputCardTitle} sx={{ color: '#4338ca' }}>
            Short Description
          </Typography>
        </Box>
        <Box className={classes.inputCardBody}>
          <TextField
            label='Short Description'
            value={shortDesc}
            onChange={(e) => onShortDescChange(e.target.value)}
            placeholder='Brief summary of the issue...'
          />
        </Box>
      </Box>

      {/* Issue Description card */}
      <Box className={classes.inputCard} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box className={classes.inputCardHeader}>
          <Box className={`${classes.inputCardIconBadge} ${classes.iconBadgeCyan}`}>
            <DescriptionOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
          <Typography className={classes.inputCardTitle} sx={{ color: '#0e7490' }}>
            Issue Description
          </Typography>
        </Box>
        <Box className={`${classes.inputCardBody} ${classes.issueDescBody}`}>
          <TextField
            label='Describe the issue'
            value={issueText}
            onChange={(e) => onIssueTextChange(e.target.value)}
            multiline
            minRows={6}
            placeholder='Describe the issue in detail to find matching solutions...'
            sx={{
              '& .MuiInputBase-root': { height: '100%' },
              '& textarea': { height: '100% !important', overflow: 'auto !important' },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default InputColumn;
