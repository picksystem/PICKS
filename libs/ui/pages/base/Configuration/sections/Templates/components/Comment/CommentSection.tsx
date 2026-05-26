import { useState, useEffect } from 'react';
import { IConfigCommentTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { useStyles } from '../../styles';
import { COMMENT_CONFIG, commentColumns } from '../shared/TemplatesPanelConfig';

interface CommentSectionProps {
  data?: IConfigCommentTemplate[];
  onDataChange?: (data: IConfigCommentTemplate[]) => void;
}

const CommentSection = ({ data, onDataChange }: CommentSectionProps) => {
  const { classes } = useStyles();
  const { commentTemplates, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigCommentTemplate[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (commentTemplates?.items) {
      setRows(commentTemplates.items);
    }
  }, [data, commentTemplates]);

  const handleSave = (next: IConfigCommentTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('commentTemplates', { items: next });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={COMMENT_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={commentColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { CommentSection };
