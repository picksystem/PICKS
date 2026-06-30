export interface IConfigField {
  id: number | string;
  date: string;
  day: string;
  calendarWeek: string;
  calendarMonth: string;
  control: string;
}

export interface FieldConfigurationsSectionProps {
  data?: IConfigField[];
  isLoading?: boolean;
  onDataChange?: (data: IConfigField[]) => void;
  onCreate?: (data: Omit<IConfigField, 'id'>) => Promise<void>;
  onUpdate?: (id: number | string, data: Partial<IConfigField>) => Promise<void>;
  onDelete?: (id: number | string) => Promise<void>;
}
