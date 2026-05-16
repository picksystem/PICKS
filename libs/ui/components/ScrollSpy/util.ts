export interface DSScrollSpySection {
  id: string;
  label: string;
}

export interface DSScrollSpyProps {
  sections: DSScrollSpySection[];
  offset?: number;
  onSectionChange?: (sectionId: string) => void;
  className?: string;
  variant?: 'vertical' | 'horizontal';
  position?: 'fixed' | 'absolute' | 'relative' | 'sticky';
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  smoothScroll?: boolean;
  scrollBehavior?: 'smooth' | 'auto';
}
