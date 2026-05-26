import { ReactNode } from 'react';
import { Box, Typography } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStyles } from './styles';

interface GenericAccordionProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent?: string;
  defaultExpanded?: boolean;
  className?: string;
  children: ReactNode;
}

export const GenericAccordion = ({
  title,
  subtitle,
  icon,
  accent = '#0369a1',
  defaultExpanded = true,
  className,
  children,
}: GenericAccordionProps) => {
  const { classes } = useStyles();

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      className={`${classes.accordion} ${className || ''}`}
      elevation={0}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
        classes={{ root: classes.accordionSummary }}
      >
        <Box className={classes.headerContainer}>
          <Box className={classes.iconBox} sx={{ bgcolor: accent }}>
            <Box className={classes.icon}>{icon}</Box>
          </Box>

          <Box>
            <Typography className={classes.title}>{title}</Typography>

            <Typography className={classes.subtitle}>{subtitle}</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails className={classes.accordionDetails}>{children}</AccordionDetails>
    </Accordion>
  );
};
