import { IConfigApplicationCategory } from '@serviceops/interfaces';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApplicationCategoriesSectionProps {
  data?: IConfigApplicationCategory[];
  onDataChange?: (data: IConfigApplicationCategory[]) => void;
}
