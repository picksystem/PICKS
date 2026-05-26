import { IConfigApplicationNumberSequence } from '@serviceops/interfaces';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApplicationNumberSequencesSectionProps {
  data?: IConfigApplicationNumberSequence[];
  onDataChange?: (data: IConfigApplicationNumberSequence[]) => void;
}
