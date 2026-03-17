import {
  Accordion as MUIAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStyles } from './styles/Accordion.styles';

interface DSAccordionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  expandIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Accordion: React.FC<DSAccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  expanded,
  onChange,
  expandIcon,
  className,
  disabled = false,
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
