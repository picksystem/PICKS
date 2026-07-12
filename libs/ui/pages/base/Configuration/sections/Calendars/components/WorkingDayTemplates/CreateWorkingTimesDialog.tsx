import { ConfigFormDialog } from '@serviceops/configdialogs';
import {
  DayOfWeek,
  IConfigWorkingDayTemplate,
  IConfigWorkingDayTemplateTime,
} from '@serviceops/interfaces';
import { CreateWorkingTimesPanel } from './CreateWorkingTimesPanel';
import { WORKING_DAY_TEMPLATE_TIMES_CONFIG } from './WorkingDayTemplatesSection.config';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

interface CreateWorkingTimesDialogProps {
  open: boolean;
  onClose: () => void;
  templates: IConfigWorkingDayTemplate[];
  timeBlocks: IConfigWorkingDayTemplateTime[];
  onSave: (next: IConfigWorkingDayTemplateTime[]) => void;
  templateId?: string;
  day?: DayOfWeek;
}

const CreateWorkingTimesDialog = ({
  open,
  onClose,
  templates,
  timeBlocks,
  onSave,
  templateId,
  day,
}: CreateWorkingTimesDialogProps) => {
  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={onClose}
      isEdit={false}
      icon={WORKING_DAY_TEMPLATE_TIMES_CONFIG.icon}
      accent={WORKING_DAY_TEMPLATE_TIMES_CONFIG.accent}
      title='Working Times'
      editTitle={day ? `Create Working Times — ${DAY_LABELS[day]}` : 'Create Working Times'}
      subtitle={WORKING_DAY_TEMPLATE_TIMES_CONFIG.subtitle}
      maxWidth='md'
    >
      {open && day && (
        <CreateWorkingTimesPanel
          key={`${templateId ?? ''}-${day}`}
          templates={templates}
          timeBlocks={timeBlocks}
          onSave={onSave}
          initialTemplateId={templateId}
          day={day}
        />
      )}
    </ConfigFormDialog>
  );
};

export { CreateWorkingTimesDialog };
