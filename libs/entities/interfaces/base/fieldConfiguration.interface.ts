export interface IFieldConfiguration {
  id: number | string;
  date: string;
  day: string;
  calendarWeek: string;
  calendarMonth: string;
  control: string;
}

// Prisma entity type for database operations
export interface IFieldConfigurationEntity {
  id: number;
  date: string;
  day: string;
  calendarWeek: string;
  calendarMonth: string;
  control: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFieldConfigurationListResponse {
  data: IFieldConfiguration[];
}

export interface IFieldConfigurationResponse {
  data: IFieldConfiguration;
}

export interface ICreateFieldConfigurationInput {
  date: string;
  day: string;
  calendarWeek: string;
  calendarMonth: string;
  control: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateFieldConfigurationInput {
  date?: string;
  day?: string;
  calendarWeek?: string;
  calendarMonth?: string;
  control?: string;
}
