import { Box, Button } from '@serviceops/component';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import {
  DayOfWeek,
  IConfigWorkingDayTemplate,
  IConfigWorkingDayTemplateTime,
} from '@serviceops/interfaces';
import { CreateWorkingTimesPanel } from './CreateWorkingTimesPanel';
import { WORKING_DAY_TEMPLATE_TIMES_CONFIG } from './WorkingDayTemplatesSection.config';

interface CreateWorkingTimesDialogProps {
  open: boolean;
  onClose: () => void;
  templates: IConfigWorkingDayTemplate[];
  timeBlocks: IConfigWorkingDayTemplateTime[];
  onSave: (next: IConfigWorkingDayTemplateTime[]) => void;
  initialTemplateId?: string;
  initialDay?: DayOfWeek;
  initialBlockId?: string | null;
}

const CreateWorkingTimesDialog = ({
  open,
  onClose,
  templates,
  timeBlocks,
  onSave,
  initialTemplateId,
  initialDay,
  initialBlockId,
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
      editTitle='Create Working Times'
      subtitle={WORKING_DAY_TEMPLATE_TIMES_CONFIG.subtitle}
      hideActions
      maxWidth='md'
    >
      {open && (
        <CreateWorkingTimesPanel
          key={`${initialTemplateId ?? ''}-${initialDay ?? ''}-${initialBlockId ?? ''}`}
          templates={templates}
          timeBlocks={timeBlocks}
          onSave={onSave}
          initialTemplateId={initialTemplateId}
          initialDay={initialDay}
          initialBlockId={initialBlockId}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant='contained'
          onClick={onClose}
          sx={{ textTransform: 'none', bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
        >
          Done
        </Button>
      </Box>
    </ConfigFormDialog>
  );
};

export { CreateWorkingTimesDialog };
