import * as yup from 'yup';

export const CreateFieldConfigurationSchema = yup.object({
  date: yup.string().required('Date is required'),
  day: yup.string().required('Day is required'),
  calendarWeek: yup.string().required('Calendar week is required'),
  calendarMonth: yup.string().required('Calendar month is required'),
  control: yup.string().required('Control is required'),
});

export const UpdateFieldConfigurationSchema = yup.object({
  date: yup.string(),
  day: yup.string(),
  calendarWeek: yup.string(),
  calendarMonth: yup.string(),
  control: yup.string(),
});

export const FieldConfigurationIdSchema = yup.number().integer().positive().required();
