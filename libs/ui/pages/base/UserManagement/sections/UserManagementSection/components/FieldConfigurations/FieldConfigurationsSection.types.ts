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
  /**
   * Hide GenericPanel's own New/Edit/Delete/Clear + search toolbar. Use this
   * when those actions are driven from an external `GenericToolbar` instead
   * (e.g. `FieldConfigurationsAccordion`'s Holiday-Calendar-style toolbar),
   * so the buttons aren't rendered twice.
   */
  hideToolbar?: boolean;
  /** Controlled selected row id — mirrors GenericPanel's own selectedRowId/onRowSelect convention. */
  selectedRowId?: number | string | null;
  /** Notifies the parent whenever the selection changes (row click or Clear). */
  onSelectedRowIdChange?: (id: number | string | null) => void;
}

/** Imperative handle for driving the New/Edit/Delete dialogs from an external toolbar. */
export interface FieldConfigurationsSectionHandle {
  openNew: () => void;
  openEdit: () => void;
  openDelete: () => void;
}
