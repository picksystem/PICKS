import type { IConfigApplicationQueue } from '@serviceops/interfaces';

export interface QueueStickyNoteSectionProps {
  rows?: IConfigApplicationQueue[];
  onStickyNoteChange?: (stickyNote: string) => void;
}
