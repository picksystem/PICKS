import { useState, useCallback, type ReactNode } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export interface DraggableSectionItem {
  id: string;
  node: ReactNode;
}

export interface DraggableSectionListProps {
  /** Ordered list of section items */
  items: DraggableSectionItem[];
  /** Called with new order of IDs after reorder */
  onReorder: (newOrder: string[]) => void;
  /** Gap between sections in px (default 24) */
  gap?: number;
  /** Pointer travel distance before drag activates (default 8px) */
  activationDistance?: number;
  /** Disable drag handles */
  disabled?: boolean;
}

// ── Sortable item ────────────────────────────────────────────────

interface SortableItemProps {
  id: string;
  node: ReactNode;
  disabled: boolean;
}

const SortableItem = ({ id, node, disabled }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <Box
      ref={setNodeRef}
      style={{
        position: 'relative',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 9999 : undefined,
      }}
    >
      {node}
      <Box
        {...(!disabled ? listeners : {})}
        {...attributes}
        sx={{
          position: 'absolute',
          left: -28,
          top: 0,
          bottom: 0,
          width: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'default' : 'grab',
          color: '#94a3b8',
          zIndex: 2,
          transition: 'color 0.15s ease, background-color 0.15s ease',
          '&:hover': !disabled
            ? {
                color: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.06)',
              }
            : undefined,
          '&:active': !disabled
            ? {
                cursor: 'grabbing',
                color: '#4338ca',
              }
            : undefined,
        }}
      >
        <DragIndicatorIcon fontSize='small' sx={{ pointerEvents: 'none', color: 'inherit' }} />
      </Box>
    </Box>
  );
};

// ── Main component ───────────────────────────────────────────────

const DraggableSectionList = ({
  items,
  onReorder,
  gap = 24,
  activationDistance = 8,
  disabled = false,
}: DraggableSectionListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const itemMap = useCallback(() => {
    const m = new Map<string, DraggableSectionItem>();
    for (const item of items) m.set(item.id, item);
    return m;
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: activationDistance },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const ids = items.map((i) => i.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = [...ids];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next);
  };

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const map = itemMap();
  const activeItem = activeId ? map.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          position: 'relative',
          paddingLeft: 28,
        }}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} node={item.node} disabled={disabled} />
          ))}
        </SortableContext>
      </Box>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeItem ? (
          <Box
            sx={{
              opacity: 0.95,
              boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              borderRadius: 2,
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            {activeItem.node}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableSectionList;
