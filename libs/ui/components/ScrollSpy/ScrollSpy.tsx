import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useStyles } from './styles';
import { DSScrollSpyProps } from './util';

const ScrollSpy: React.FC<DSScrollSpyProps> = ({
  sections,
  offset = 100,
  onSectionChange,
  className,
  variant = 'vertical',
  position = 'relative',
  top,
  bottom,
  left,
  right,
  smoothScroll = true,
  scrollBehavior = 'smooth',
  ...rest
}) => {
  const { cx, classes } = useStyles();
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (activeSection !== section.id) {
              setActiveSection(section.id);
              onSectionChange?.(section.id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, offset, activeSection, onSectionChange]);

  const scrollToSection = (sectionId: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: smoothScroll ? scrollBehavior : 'auto',
      });
    }
  };

  const variantClass = {
    vertical: classes.vertical,
    horizontal: classes.horizontal,
  };

  return (
    <Box
      className={cx(classes.root, variantClass[variant], className)}
      sx={{
        position,
        top,
        bottom,
        left,
        right,
      }}
      {...rest}
    >
      <ul className={classes.nav}>
        {sections.map((section) => (
          <li key={section.id} className={classes.navItem}>
            <a
              href={`#${section.id}`}
              className={cx(classes.navLink, activeSection === section.id && classes.active)}
              onClick={(e) => scrollToSection(section.id, e)}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default ScrollSpy;
