import { useState, useEffect } from 'react';
import { IConfigInternalNoteTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { INTERNAL_NOTE_CONFIG, internalNoteColumns } from '../shared/TemplatesPanelConfig';

interface InternalNoteSectionProps {
  data?: IConfigInternalNoteTemplate[];
  onDataChange?: (data: IConfigInternalNoteTemplate[]) => void;
}

const InternalNoteSection = ({ data, onDataChange }: InternalNoteSectionProps) => {
  const { classes } = useStyles();
  const { internalNoteTemplates, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigInternalNoteTemplate[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (internalNoteTemplates?.items) {
      setRows(internalNoteTemplates.items);
    }
  }, [data, internalNoteTemplates]);

  const handleSave = (next: IConfigInternalNoteTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('internalNoteTemplates', { items: next });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={INTERNAL_NOTE_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={internalNoteColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { InternalNoteSection };
