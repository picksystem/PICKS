import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Box, Typography } from '@serviceops/component';
import { useStyles } from '../styles';
import { InputColumnProps } from './types';
import {
  parseRichText,
  RichTextEditor,
  serializeRichText,
} from '../../Configuration/shared/RichTextEditor';

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
          <input
            type='text'
            value={shortDesc}
            onChange={(e) => onShortDescChange(e.target.value)}
            placeholder='Brief summary of the issue...'
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.9rem',
              border: '1px solid rgba(226,232,255,0.9)',
              borderRadius: 10,
              background: '#f8faff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
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
          <RichTextEditor
            title='Describe the issue'
            value={parseRichText(issueText)}
            onChange={(richVal) => {
              const plain = serializeRichText(richVal.segments);
              onIssueTextChange(plain);
            }}
            placeholder='Describe the issue in detail to find matching solutions...'
            showFooterActions={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default InputColumn;
