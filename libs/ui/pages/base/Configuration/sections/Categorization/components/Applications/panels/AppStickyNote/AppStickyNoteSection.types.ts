import type { IConfigApplication } from '@serviceops/interfaces';

export interface AppStickyNoteSectionProps {
  rows?: IConfigApplication[];
  onStickyNoteChange?: (stickyNote: string) => void;
}
