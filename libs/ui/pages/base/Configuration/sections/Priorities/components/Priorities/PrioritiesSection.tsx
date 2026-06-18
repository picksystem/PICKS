import { useState, useCallback, useMemo } from 'react';
import { Box, Typography } from '@serviceops/component';
import { PriorityLevel, validatePriorityDuplicate } from '../../util';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { PRIORITY_TABLE_CONFIG } from '../shared/PrioritiesPanelConfig';
import {
  parseRichText,
  segmentsToHtml,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

const renderRichTextCell = (v: unknown, maxWidth: number): React.ReactNode => {
  const raw = String(v || '');
  if (!raw) {
    return (
      <Typography
        variant='body2'
        color='text.secondary'
        fontSize='0.78rem'
        sx={{ fontStyle: 'italic' }}
      >
        —
      </Typography>
    );
  }
  const html = segmentsToHtml(parseRichText(raw).segments);
  const plainText = parseRichText(raw)
    .segments.map((s) => s.text)
    .join(' • ');
  return (
    <Box
      title={plainText}
      sx={{
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.78rem',
        color: 'text.secondary',
        lineHeight: 1.5,
        '& b': { fontWeight: 700, color: 'text.primary' },
        '& i': { fontStyle: 'italic' },
        '& u': { textDecoration: 'underline' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface PrioritiesSectionProps {
  priorities: PriorityLevel[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityLevel[]>>;
  onPersist: (priorities: PriorityLevel[]) => void;
  activeTicketTypeColumns: { key: string; label: string }[];
  selectedPriorityId: string | null;
  setSelectedPriorityId: (id: string | null) => void;
  setSelectedPriority: (priority: PriorityLevel | null) => void;
}

const PrioritiesSection = ({
  priorities,
  setPriorities,
  onPersist,
  activeTicketTypeColumns,
  selectedPriorityId,
  setSelectedPriorityId,
  setSelectedPriority,
}: PrioritiesSectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSave = useCallback(
    (data: PriorityLevel[]) => {
      setPriorities(data);
      onPersist(data);
    },
    [setPriorities, onPersist],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPriorityId) return;
    try {
      const next = priorities.filter((p) => p.id !== selectedPriorityId);
      handleSave(next);
      success('Priority deleted successfully');
      setSelectedPriorityId(null);
      setSelectedPriority(null);
    } catch (err) {
      showError('Failed to delete priority. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }, [
    selectedPriorityId,
    priorities,
    handleSave,
    success,
    showError,
    setSelectedPriorityId,
    setSelectedPriority,
  ]);

  const customColumns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Priority',
        minWidth: 140,
        format: (_v: unknown, row: Record<string, unknown>): React.ReactNode => {
          const color = String(row.bgColor || '#2563eb');
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: color,
                  flexShrink: 0,
                }}
              />
              <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
                {String(row.name)}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'shortDescription',
        label: 'Short Description',
        minWidth: 200,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 260),
      },
      {
        id: 'description',
        label: 'Description',
        minWidth: 240,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 300),
      },
      {
        id: 'internalNote',
        label: 'Internal note',
        minWidth: 200,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 260),
      },
      ...activeTicketTypeColumns.map((t) => ({
        id: `enabledFor_${t.key}`,
        label: t.label,
        minWidth: 130,
        align: 'center' as const,
        format: (_v: unknown, row: PriorityLevel): React.ReactNode => {
          // Guard against rows that haven't been enriched with enabledFor
          // (e.g. rows just added via the inline GenericPanel editor, which
          // only carries the form fields and not the full PriorityLevel).
          const isActive = row?.enabledFor?.[t.key] ?? false;
          return (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: 999,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
                minWidth: 96,
                border: '1px solid',
                borderColor: isActive ? '#16a34a' : '#cbd5e1',
                bgcolor: isActive ? '#dcfce7' : '#f1f5f9',
                color: isActive ? '#15803d' : '#64748b',
              }}
            >
              <Box
                component='span'
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: isActive ? '#16a34a' : '#94a3b8',
                  boxShadow: isActive ? '0 0 0 3px rgba(22, 163, 74, 0.18)' : 'none',
                }}
              />
              {isActive ? 'Active' : 'Inactive'}
            </Box>
          );
        },
      })),
    ],
    [activeTicketTypeColumns],
  );

  const handleTableSave = useCallback(
    (data: PriorityLevel[]) => {
      // The GenericPanel inline editor only carries the form fields, so a
      // brand-new row will be missing `enabledFor`, `color`, `sortOrder`,
      // and `accessControl`. Enrich any row that's missing them with sane
      // defaults so the table's format functions (which read `enabledFor`)
      // don't throw on the first render after adding.
      const enriched = data.map((p) => ({
        ...p,
        color: p.color ?? '#fff',
        sortOrder: p.sortOrder ?? 0,
        enabledFor:
          p.enabledFor ?? Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
        accessControl: p.accessControl ?? ['admin', 'consultant', 'endUser'],
      }));
      setPriorities(enriched);
      onPersist(enriched);
    },
    [setPriorities, onPersist, activeTicketTypeColumns],
  );

  const handleRowSelect = useCallback(
    (id: string | null) => {
      setSelectedPriorityId(id);
      setSelectedPriority(priorities.find((p) => p.id === id) ?? null);
    },
    [setSelectedPriorityId, setSelectedPriority, priorities],
  );

  const selectedPriority = priorities.find((p) => p.id === selectedPriorityId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={PRIORITY_TABLE_CONFIG}
        data={priorities as unknown as Record<string, unknown>[]}
        onSave={handleTableSave}
        variant='plain'
        customColumns={customColumns as unknown as undefined}
        selectedRowId={selectedPriorityId}
        onRowSelect={handleRowSelect}
        validateFields={validatePriorityDuplicate as unknown as undefined}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Priority'
        itemName={selectedPriority?.name ?? ''}
      />
    </div>
  );
};

export { PrioritiesSection };
