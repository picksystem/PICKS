import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, TextField, Select, Checkbox } from '@serviceops/component';
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
  /** Seeds which template/day/block is focused when the dialog opens (e.g. for Edit). */
  initialTemplateId?: string;
  initialDay?: DayOfWeek;
  initialBlockId?: string | null;
}

const WEEKDAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

// Matches "Only 00:00 to 23:59 allowed (HH:MM)" from the field spec.
const TIME_PATTERN = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

const toMinutes = (t: string): number | null => {
  if (!TIME_PATTERN.test(t || '')) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const emptyDayMap = (): Record<DayOfWeek, IConfigWorkingDayTemplateTime[]> => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

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
  initialDay,
  initialBlockId,
}: CreateWorkingTimesPanelProps) => {
  const { accent } = WORKING_DAY_TEMPLATE_TIMES_CONFIG;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || templates[0]?.id || '',
  );
  const [expandedDay, setExpandedDay] = useState<DayOfWeek>(initialDay ?? 'monday');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(initialBlockId ?? null);
  const [copyAnchor, setCopyAnchor] = useState<HTMLElement | null>(null);
  const [copyTargets, setCopyTargets] = useState<DayOfWeek[]>([]);

  useEffect(() => {
    if ((!selectedTemplateId || !templates.some((t) => t.id === selectedTemplateId)) && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  const blocksByDay = useMemo(() => {
    const map = emptyDayMap();
    timeBlocks
      .filter((b) => b.workingDayTemplateId === selectedTemplateId)
      .forEach((b) => {
        map[b.dayOfWeek]?.push(b);
      });
    return map;
  }, [timeBlocks, selectedTemplateId]);

  const updateDayBlocks = (day: DayOfWeek, nextDayBlocks: IConfigWorkingDayTemplateTime[]) => {
    const others = timeBlocks.filter(
      (b) => !(b.workingDayTemplateId === selectedTemplateId && b.dayOfWeek === day),
    );
    onSave([...others, ...nextDayBlocks]);
  };

  const handleAdd = (day: DayOfWeek) => {
    const newBlock: IConfigWorkingDayTemplateTime = {
      id: newBlockId(),
      workingDayTemplateId: selectedTemplateId,
      dayOfWeek: day,
      fromTime: '',
      toTime: '',
      efficiency: 100,
    };
    updateDayBlocks(day, [...blocksByDay[day], newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleRemove = (day: DayOfWeek) => {
    if (!selectedBlockId) return;
    updateDayBlocks(
      day,
      blocksByDay[day].filter((b) => b.id !== selectedBlockId),
    );
    setSelectedBlockId(null);
  };

  const handleBlockChange = (
    day: DayOfWeek,
    blockId: string,
    patch: Partial<IConfigWorkingDayTemplateTime>,
  ) => {
    updateDayBlocks(
      day,
      blocksByDay[day].map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
    );
  };

  const handleOpenCopy = (e: React.MouseEvent<HTMLElement>) => {
    setCopyAnchor(e.currentTarget);
    setCopyTargets([]);
  };

  const handleConfirmCopy = () => {
    const sourceBlocks = blocksByDay[expandedDay];
    const additions: IConfigWorkingDayTemplateTime[] = [];
    copyTargets.forEach((day) => {
      sourceBlocks.forEach((b) => {
        additions.push({ ...b, id: newBlockId(), dayOfWeek: day });
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, pb: 1.5 }}>
        <Box>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
            Working day templates
          </Typography>
          <Select
            variant='standard'
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(String(e.target.value));
              setSelectedBlockId(null);
            }}
            options={templates.map((t) => ({ value: t.id, label: t.name }))}
            disableUnderline
            sx={{ fontWeight: 700, color: accent, minWidth: 100 }}
          />
        </Box>
        <Box>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
            Name
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', pt: '9px' }}>
            {selectedTemplate?.shortDescription || selectedTemplate?.description || '—'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {WEEKDAYS.map(({ key, label }) => {
          const blocks = blocksByDay[key];
          const isExpanded = expandedDay === key;

          if (!isExpanded) {
            return (
              <Box
                key={key}
                onClick={() => setExpandedDay(key)}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(accent, 0.25),
                  borderRadius: '8px',
                  px: 2,
                  py: 1.25,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(accent, 0.04) },
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</Typography>
              </Box>
            );
          }

          return (
            <Box
              key={key}
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
                onClick={() => setExpandedDay(key)}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{label}</Typography>
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
                  onClick={() => handleAdd(key)}
                  sx={{ textTransform: 'none', bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                >
                  Add
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => handleRemove(key)}
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
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
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
                            onChange={(v) => handleBlockChange(key, block.id, { fromTime: v })}
                          />
                        </TableCell>
                        <TableCell>
                          <TimePickerField
                            label=''
                            value={block.toTime}
                            onChange={(v) => handleBlockChange(key, block.id, { toTime: v })}
                          />
                          {error && (
                            <Typography
                              variant='caption'
                              color='error'
                              sx={{ display: 'block', mt: 0.5 }}
                            >
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
                              handleBlockChange(key, block.id, {
                                efficiency: Number(e.target.value),
                              })
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
          );
        })}
      </Box>

      <Popover
        open={Boolean(copyAnchor)}
        anchorEl={copyAnchor}
        onClose={() => setCopyAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
            Copy {WEEKDAYS.find((d) => d.key === expandedDay)?.label}&apos;s working times to:
          </Typography>
          {WEEKDAYS.filter((d) => d.key !== expandedDay).map((d) => (
            <Checkbox
              key={d.key}
              label={d.label}
              checked={copyTargets.includes(d.key)}
              onChange={(e) => {
                setCopyTargets((prev) =>
                  e.target.checked ? [...prev, d.key] : prev.filter((k) => k !== d.key),
                );
              }}
              size='small'
            />
          ))}
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 1, mb: 1 }}
          >
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
