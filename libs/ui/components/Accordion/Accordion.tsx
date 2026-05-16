import {
  Accordion as MUIAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStyles } from './styles/Accordion.styles';
import type { DSAccordionProps } from './util';

const Accordion: React.FC<DSAccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  expanded,
  onChange,
  expandIcon,
  className,
  disabled = false,
  sx,
  disableGutters,
  elevation = 1,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <MUIAccordion
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onChange={onChange}
      disabled={disabled}
      className={cx(classes.root, className)}
      sx={sx}
      disableGutters={disableGutters}
      elevation={elevation}
      {...rest}
    >
      <AccordionSummary expandIcon={expandIcon || <ExpandMoreIcon />}>
        {typeof title === 'string' ? (
          <Typography className={classes.title}>{title}</Typography>
        ) : (
          title
        )}
      </AccordionSummary>

      <AccordionDetails className={classes.details}>{children}</AccordionDetails>
    </MUIAccordion>
  );
};

export default Accordion;
