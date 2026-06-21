import { RichTextEditor, parseRichText } from '@serviceops/richtexteditor';
import { QUEUE_STICKY_NOTE_CONFIG } from './QueueStickyNoteSection.config';
import { QueueStickyNoteSectionProps } from './QueueStickyNoteSection.types';

export const QueueStickyNoteSection = ({
  rows,
  onStickyNoteChange,
}: QueueStickyNoteSectionProps) => {
  const stickyNoteValue = parseRichText(rows?.[0]?.stickyNote || '');

  const handleChange = (newValue: {
    segments: Array<{ text: string; bold?: boolean; italic?: boolean; underline?: boolean }>;
  }) => {
    const textContent = newValue.segments
      .map((s) => {
        let prefix = '';
        let suffix = '';
        if (s.bold) {
          prefix += '**';
          suffix = `**${suffix}`;
        }
        if (s.italic) {
          prefix += '*';
          suffix = `*${suffix}`;
        }
        if (s.underline) {
          prefix += '__';
          suffix = `__${suffix}`;
        }
        return prefix + s.text + suffix;
      })
      .join('');
    onStickyNoteChange?.(textContent);
  };

  return (
    <RichTextEditor
      value={stickyNoteValue}
      onChange={handleChange}
      accent={QUEUE_STICKY_NOTE_CONFIG.accent}
      icon={QUEUE_STICKY_NOTE_CONFIG.icon}
      title={QUEUE_STICKY_NOTE_CONFIG.title}
    />
  );
};
