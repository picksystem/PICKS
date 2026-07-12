import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Checkbox } from '@serviceops/component';
import {
  alpha,
  Radio,
  Popover,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TimePickerField } from '@serviceops/pages/base/Configuration/shared/GenericPanel/components/TimePickerField/TimePickerField';
import {
  DayOfWeek,
  IConfigWorkingDayTemplate,
  IConfigWorkingDayTemplateTime,
} from '@serviceops/interfaces';
import { WORKING_DAY_TEMPLATE_TIMES_CONFIG } from './WorkingDayTemplatesSection.config';

interface CreateWorkingTimesPanelProps {
  templates: IConfigWorkingDayTemplate[];
  timeBlocks: IConfigWorkingDayTemplateTime[];
  onSave: (next: IConfigWorkingDayTemplateTime[]) => void;
  /** Which template's blocks are being edited. */
  initialTemplateId?: string;
  /** The single weekday this dialog is scoped to. */
  day: DayOfWeek;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const WEEKDAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Matches "Only 00:00 to 23:59 allowed (HH:MM)" from the field spec.
const TIME_PATTERN = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

const toMinutes = (t: string): number | null => {
  if (!TIME_PATTERN.test(t || '')) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const dayHours = (blocks: IConfigWorkingDayTemplateTime[]): number =>
  blocks.reduce((sum, b) => {
    const from = toMinutes(b.fromTime);
    const to = toMinutes(b.toTime);
    if (from === null || to === null || to <= from) return sum;
    return sum + (to - from) / 60;
  }, 0);

let blockIdSeq = 0;
const newBlockId = () => `wdt-time-${Date.now()}-${blockIdSeq++}`;

// "Working hours" per the field spec is display-only and derived from
// From/To — it is never stored on the block itself.
const validateBlock = (block: IConfigWorkingDayTemplateTime): string | null => {
  if (block.fromTime && !TIME_PATTERN.test(block.fromTime)) {
    return 'From must be a valid time (00:00–23:59)';
  }
  if (block.toTime && !TIME_PATTERN.test(block.toTime)) {
    return 'To must be a valid time (00:00–23:59)';
  }
  const from = toMinutes(block.fromTime);
  const to = toMinutes(block.toTime);
  if (from !== null && to !== null && to <= from) {
    return 'To must be after From';
  }
  if (block.efficiency < 0 || block.efficiency > 100) {
    return 'Efficiency must be between 0 and 100%';
  }
  return null;
};

const CreateWorkingTimesPanel = ({
  templates,
  timeBlocks,
  onSave,
  initialTemplateId,
  day,
}: CreateWorkingTimesPanelProps) => {
  const { accent } = WORKING_DAY_TEMPLATE_TIMES_CONFIG;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || templates[0]?.id || '',
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [copyAnchor, setCopyAnchor] = useState<HTMLElement | null>(null);
  const [copyTargets, setCopyTargets] = useState<DayOfWeek[]>([]);

  useEffect(() => {
    if (
      (!selectedTemplateId || !templates.some((t) => t.id === selectedTemplateId)) &&
      templates.length > 0
    ) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const blocks = timeBlocks.filter(
    (b) => b.workingDayTemplateId === selectedTemplateId && b.dayOfWeek === day,
  );

  const updateBlocks = (nextBlocks: IConfigWorkingDayTemplateTime[]) => {
    const others = timeBlocks.filter(
      (b) => !(b.workingDayTemplateId === selectedTemplateId && b.dayOfWeek === day),
    );
    onSave([...others, ...nextBlocks]);
  };

  const handleAdd = () => {
    const newBlock: IConfigWorkingDayTemplateTime = {
      id: newBlockId(),
      workingDayTemplateId: selectedTemplateId,
      dayOfWeek: day,
      fromTime: '',
      toTime: '',
      efficiency: 100,
    };
    updateBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleRemove = () => {
    if (!selectedBlockId) return;
    updateBlocks(blocks.filter((b) => b.id !== selectedBlockId));
    setSelectedBlockId(null);
  };

  const handleBlockChange = (blockId: string, patch: Partial<IConfigWorkingDayTemplateTime>) => {
    updateBlocks(blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)));
  };

  const handleOpenCopy = (e: React.MouseEvent<HTMLElement>) => {
    setCopyAnchor(e.currentTarget);
    setCopyTargets([]);
  };

  // Copies this day's blocks onto the selected target days, replacing
  // whatever blocks those days already had for this template.
  const handleConfirmCopy = () => {
    const additions: IConfigWorkingDayTemplateTime[] = [];
    copyTargets.forEach((targetDay) => {
      blocks.forEach((b) => {
        additions.push({ ...b, id: newBlockId(), dayOfWeek: targetDay });
      });
    });
    const untouched = timeBlocks.filter(
      (b) =>
        !(b.workingDayTemplateId === selectedTemplateId && copyTargets.includes(b.dayOfWeek)),
    );
    onSave([...untouched, ...additions]);
    setCopyAnchor(null);
    setCopyTargets([]);
  };

  if (templates.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='text.secondary'>
          Create a Working time template first, then come back here to define its working times.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          border: '1px solid',
          borderColor: alpha(accent, 0.3),
          borderRadius: '8px',
          p: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{DAY_LABELS[day]}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
              Hours
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: alpha(accent, 0.3),
                borderRadius: 1,
                px: 1,
                py: 0.25,
                minWidth: 64,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {dayHours(blocks).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            size='small'
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              textTransform: 'none',
              bgcolor: '#2d5ebb',
              '&:hover': { bgcolor: '#2d5ebb' },
            }}
          >
            Add
          </Button>
          <Button
            size='small'
            variant='outlined'
            color='error'
            startIcon={<DeleteOutlineIcon />}
            onClick={handleRemove}
            disabled={!selectedBlockId || !blocks.some((b) => b.id === selectedBlockId)}
            sx={{ textTransform: 'none' }}
          >
            Remove
          </Button>
          <Button
            size='small'
            variant='outlined'
            startIcon={<ContentCopyIcon />}
            onClick={handleOpenCopy}
            disabled={blocks.length === 0}
            sx={{
              textTransform: 'none',
              borderColor: '#2d5ebb',
              color: '#2d5ebb',
              '&:hover': { borderColor: '#2d5ebb', bgcolor: alpha('#2d5ebb', 0.08) },
            }}
          >
            Copy day
          </Button>
        </Box>

        <Table size='small' sx={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 48 }} />
            <col style={{ width: '38%' }} />
            <col style={{ width: '38%' }} />
            <col style={{ width: '24%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox' />
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>From</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>To</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                Efficiency property
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant='caption' color='text.disabled'>
                    No working times added yet — click Add to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {blocks.map((block) => {
              const error = validateBlock(block);
              const isSelected = selectedBlockId === block.id;
              return (
                <TableRow
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  selected={isSelected}
                  sx={{
                    bgcolor: isSelected ? alpha(accent, 0.08) : 'transparent',
                    '&.Mui-selected': { bgcolor: alpha(accent, 0.08) },
                  }}
                >
                  <TableCell padding='checkbox'>
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedBlockId(block.id)}
                      size='small'
                      sx={{ '&.Mui-checked': { color: accent } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TimePickerField
                      label=''
                      value={block.fromTime}
                      onChange={(v) => handleBlockChange(block.id, { fromTime: v })}
                    />
                  </TableCell>
                  <TableCell>
                    <TimePickerField
                      label=''
                      value={block.toTime}
                      onChange={(v) => handleBlockChange(block.id, { toTime: v })}
                    />
                    {error && (
                      <Typography variant='caption' color='error' sx={{ display: 'block', mt: 0.5 }}>
                        {error}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type='number'
                      size='small'
                      value={block.efficiency}
                      onChange={(e) =>
                        handleBlockChange(block.id, { efficiency: Number(e.target.value) })
                      }
                      inputProps={{ min: 0, max: 100, step: 1 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Popover
        open={Boolean(copyAnchor)}
        anchorEl={copyAnchor}
        onClose={() => setCopyAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
            Copy {DAY_LABELS[day]}&apos;s working times to:
          </Typography>
          {WEEKDAYS.filter((d) => d !== day).map((d) => (
            <Checkbox
              key={d}
              label={DAY_LABELS[d]}
              checked={copyTargets.includes(d)}
              onChange={(e) => {
                setCopyTargets((prev) =>
                  e.target.checked ? [...prev, d] : prev.filter((k) => k !== d),
                );
              }}
              size='small'
            />
          ))}
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1, mb: 1 }}>
            This replaces the working times on each selected day.
          </Typography>
          <Button
            size='small'
            variant='contained'
            disabled={copyTargets.length === 0}
            onClick={handleConfirmCopy}
            sx={{ textTransform: 'none', bgcolor: accent, '&:hover': { bgcolor: accent } }}
          >
            Copy
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export { CreateWorkingTimesPanel };
