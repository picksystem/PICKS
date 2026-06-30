import type { IConfigField } from '../UserManagementSection/components/FieldConfigurations/FieldConfigurationsSection.types';

export interface FieldConfigurationsAccordionProps {
  fieldConfigurations?: IConfigField[];
  onDataChange?: (key: string, value: unknown) => void;
}
