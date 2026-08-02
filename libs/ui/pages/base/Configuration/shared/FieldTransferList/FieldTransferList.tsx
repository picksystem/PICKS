import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Box, IconButton, Typography, TextField, Tooltip } from '@serviceops/component';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { FieldOption } from '@serviceops/tickettypelayout';

export interface FieldTransferListProps {
  allFields: FieldOption[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  remainingLabel?: string;
  selectedLabel?: string;
  maxFields?: number;
  onMaxFieldsChange?: (value: number) => void;
  maxFieldsLabel?: string;
  enableDragAndDrop?: boolean;
}

const listBoxSx = {
  border: '1px solid rgba(226, 232, 255, 0.9)',
  borderRadius: '10px',
  height: 260,
  overflowY: 'auto' as const,
  bgcolor: 'background.paper',
};

const listItemSx = (selected: boolean) => ({
  px: 1.5,
  py: 0.9,
  fontSize: '0.85rem',
  cursor: 'pointer',
  bgcolor: selected ? 'rgba(59,130,246,0.14)' : 'transparent',
  color: selected ? '#1d4ed8' : 'text.primary',
  fontWeight: selected ? 600 : 400,
  borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
  '&:hover': { bgcolor: selected ? 'rgba(59,130,246,0.18)' : 'action.hover' },
});

const columnLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  mb: 0.75,
};

// ── Draggable wrapper for a selected field item ─────────────────

interface DraggableItemProps {
  id: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const DraggableItem = ({ id, label, isSelected, onClick }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { fromSelected: true },
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
    ...listItemSx(isSelected),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  return (
    <Box ref={setNodeRef} sx={style} onClick={onClick}>
      <Box
        {...listeners}
        {...attributes}
        sx={{
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          '&:active': { cursor: 'grabbing' },
          '&:hover': { color: 'primary.main' },
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <DragIndicatorIcon fontSize='small' />
      </Box>
      <Typography sx={{ flex: 1, lineHeight: 1.3 }}>{label}</Typography>
    </Box>
  );
};

// ── Droppable remaining list ──────────────────────────────────

const DroppableRemainingList = ({
  fields,
  highlightedKey,
  onHighlight,
}: {
  fields: FieldOption[];
  highlightedKey: string | null;
  onHighlight: (key: string | null) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'remaining-fields-drop-zone' });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        ...listBoxSx,
        borderColor: isOver ? 'primary.main' : undefined,
        bgcolor: isOver ? 'rgba(59,130,246,0.04)' : undefined,
      }}
    >
      {fields.length === 0 ? (
        <Typography sx={{ p: 1.5, fontSize: '0.8rem', color: 'text.secondary' }}>
          No fields remaining
        </Typography>
      ) : (
        fields.map((f) => (
          <Box
            key={f.key}
            sx={{
              ...listItemSx(highlightedKey === f.key),
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => {
              onHighlight(highlightedKey === f.key ? null : f.key);
            }}
          >
            <Typography>{f.label}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

// ── Main component ─────────────────────────────────────────────

export const FieldTransferList = ({
  allFields,
  selectedKeys,
  onChange,
  remainingLabel = 'Remaining Fields',
  selectedLabel = 'Selected Fields',
  maxFields,
  onMaxFieldsChange,
  maxFieldsLabel = 'Maximum number of fields',
  enableDragAndDrop = false,
}: FieldTransferListProps) => {
  const [highlightedRemaining, setHighlightedRemaining] = useState<string | null>(null);
  const [highlightedSelected, setHighlightedSelected] = useState<string | null>(null);

  const byKey = new Map(allFields.map((f) => [f.key, f]));
  const remaining = allFields.filter((f) => !selectedKeys.includes(f.key));
  const selected = selectedKeys.map((k) => byKey.get(k)).filter((f): f is FieldOption => !!f);

  const moveRight = () => {
    if (!highlightedRemaining) return;
    onChange([...selectedKeys, highlightedRemaining]);
    setHighlightedRemaining(null);
  };

  const moveLeft = () => {
    if (!highlightedSelected) return;
    onChange(selectedKeys.filter((k) => k !== highlightedSelected));
    setHighlightedSelected(null);
  };

  const moveUp = () => {
    if (!highlightedSelected) return;
    const idx = selectedKeys.indexOf(highlightedSelected);
    if (idx <= 0) return;
    const next = [...selectedKeys];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = () => {
    if (!highlightedSelected) return;
    const idx = selectedKeys.indexOf(highlightedSelected);
    if (idx === -1 || idx === selectedKeys.length - 1) return;
    const next = [...selectedKeys];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const renderSelectedList = () => {
    if (selected.length === 0) {
      return (
        <Box sx={listBoxSx}>
          <Typography sx={{ p: 1.5, fontSize: '0.8rem', color: 'text.secondary' }}>
            No fields selected
          </Typography>
        </Box>
      );
    }

    if (enableDragAndDrop) {
      return (
        <Box sx={listBoxSx}>
          {selected.map((f) => (
            <DraggableItem
              key={f.key}
              id={f.key}
              label={f.label}
              isSelected={highlightedSelected === f.key}
              onClick={() => {
                setHighlightedSelected(f.key);
                setHighlightedRemaining(null);
              }}
            />
          ))}
        </Box>
      );
    }

    return (
      <Box sx={listBoxSx}>
        {selected.map((f) => (
          <Box
            key={f.key}
            sx={listItemSx(highlightedSelected === f.key)}
            onClick={() => {
              setHighlightedSelected(f.key);
              setHighlightedRemaining(null);
            }}
          >
            {f.label}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
        <Typography sx={columnLabelSx}>{remainingLabel}</Typography>
        <DroppableRemainingList
          fields={remaining}
          highlightedKey={highlightedRemaining}
          onHighlight={(key) => {
            setHighlightedRemaining(key);
            setHighlightedSelected(null);
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        <Tooltip title='Add to selected'>
          <span>
            <IconButton size='small' onClick={moveRight} disabled={!highlightedRemaining}>
              <ArrowForwardIcon fontSize='small' />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title='Remove from selected'>
          <span>
            <IconButton size='small' onClick={moveLeft} disabled={!highlightedSelected}>
              <ArrowBackIcon fontSize='small' />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
        <Typography sx={columnLabelSx}>{selectedLabel}</Typography>
        {renderSelectedList()}
      </Box>

      {selectedKeys.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <Tooltip title='Move up'>
            <span>
              <IconButton size='small' onClick={moveUp} disabled={!highlightedSelected}>
                <ArrowUpwardIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Move down'>
            <span>
              <IconButton size='small' onClick={moveDown} disabled={!highlightedSelected}>
                <ArrowDownwardIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      {typeof maxFields === 'number' && onMaxFieldsChange && (
        <Box sx={{ flex: '0 0 160px', minWidth: 140 }}>
          <Typography sx={columnLabelSx}>Options:</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
            {maxFieldsLabel}
          </Typography>
          <TextField
            type='number'
            size='small'
            value={maxFields}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onMaxFieldsChange(Number.isNaN(val) ? 0 : Math.max(0, val));
            }}
            slotProps={{ htmlInput: { min: 0, max: allFields.length } }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FieldTransferList;
