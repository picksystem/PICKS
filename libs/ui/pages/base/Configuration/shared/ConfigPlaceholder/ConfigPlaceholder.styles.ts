import { CSSObject } from 'tss-react';

export const getPlaceholderStyles = (accentColor: string): Record<string, CSSObject> => ({
  container: {
    p: 3,
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.5,
    mb: 3,
  },

  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 2,
    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}bb 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    mt: 0.25,
  },

  icon: {
    color: 'white',
    fontSize: '1.2rem',
  },

  titleText: {
    fontSize: '1.25rem',
  },

  descriptionText: {
    mt: 0.25,
  },

  placeholderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 10,
    gap: 2,
    bgcolor: 'grey.50',
    borderRadius: 3,
    border: '1px dashed',
    borderColor: 'divider',
  },

  placeholderIconCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    bgcolor: `${accentColor}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIcon: {
    fontSize: '2rem',
    color: accentColor,
    opacity: 0.7,
  },

  placeholderTitle: {
    fontSize: '1.25rem',
  },

  placeholderDescription: {
    maxWidth: 340,
    px: 0,
  },
});