import { IConfigApplicationSubCategory } from '@serviceops/interfaces';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApplicationSubCategoriesSectionProps {
  data?: IConfigApplicationSubCategory[];
  onDataChange?: (data: IConfigApplicationSubCategory[]) => void;
}
