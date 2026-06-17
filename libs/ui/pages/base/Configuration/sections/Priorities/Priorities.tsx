import React, { useState, useEffect } from 'react';
import { Box } from '@serviceops/component';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BugReportIcon from '@mui/icons-material/BugReport';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TuneIcon from '@mui/icons-material/Tune';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useSharedTicketTypes } from '../../hooks/useSharedTicketTypes';
import { ConfigurationSection } from '@serviceops/configsection';
import {
  PrioritiesSection,
  ImpactSection,
  UrgencySection,
  TicketMatrixSection,
} from './components';
import { ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';
import { useNotification } from '@serviceops/hooks';
import {
  PriorityLevel,
  ImpactLevel,
  UrgencyLevel,
  ExtendedMatrixMap,
  MatrixCellData,
} from './util';
import { IConfigMatrixMap, IConfigSimplePrioritiesBucket } from '@serviceops/interfaces';

const TICKET_TYPE_COLUMNS = [
  { key: 'incident', label: 'Incident' },
  { key: 'service_request', label: 'Service Request' },
  { key: 'advisory_request', label: 'Advisory Request' },
  { key: 'change_request', label: 'Change Request' },
  { key: 'problem_request', label: 'Problem Request' },
  { key: 'task', label: 'Task' },
];

const TICKET_TYPE_MATRIX_CONFIG: Record<
  string,
  { label: string; pluralLabel: string; accentColor: string; Icon: React.ElementType }
> = {
  incident: {
    label: 'Incident',
    pluralLabel: 'Incidents',
    accentColor: '#0369a1',
    Icon: ReportProblemIcon,
  },
  service_request: {
    label: 'Service Request',
    pluralLabel: 'Service Requests',
    accentColor: '#0369a1',
    Icon: BuildIcon,
  },
  advisory_request: {
    label: 'Advisory Request',
    pluralLabel: 'Advisory Requests',
    accentColor: '#0369a1',
    Icon: LightbulbIcon,
  },
  change_request: {
    label: 'Change Request',
    pluralLabel: 'Change Requests',
    accentColor: '#0369a1',
    Icon: SwapHorizIcon,
  },
  problem_request: {
    label: 'Problem Request',
    pluralLabel: 'Problem Requests',
    accentColor: '#0369a1',
    Icon: BugReportIcon,
  },
  task: {
    label: 'Task',
    pluralLabel: 'Tasks',
    accentColor: '#0369a1',
    Icon: TaskAltIcon,
  },
};

const ALL_ENABLED: Record<string, boolean> = Object.fromEntries(
  TICKET_TYPE_COLUMNS.map((t) => [t.key, true]),
);

const DEFAULT_PRIORITIES: PriorityLevel[] = [
  {
    id: 'critical',
    name: '1-Critical',
    description: 'Business-critical outage — immediate action required across all operations',
    color: '#fff',
    bgColor: '#b91c1c',
    sortOrder: 1,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: false,
    },
    accessControl: ['admin', 'consultant', 'endUser'],
  },
  {
    id: 'high',
    name: '2-High',
    description: 'Major impact on operations — urgent attention needed within the hour',
    color: '#fff',
    bgColor: '#ea580c',
    sortOrder: 2,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: true,
    },
    accessControl: ['admin', 'consultant', 'endUser'],
  },
  {
    id: 'medium',
    name: '3-Medium',
    description: 'Moderate impact — should be addressed promptly but not immediately',
    color: '#fff',
    bgColor: '#ca8a04',
    sortOrder: 3,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: true,
    },
    accessControl: ['admin', 'consultant', 'endUser'],
  },
  {
    id: 'low',
    name: '4-Low',
    description: 'Minor impact — address when resources allow within normal SLA windows',
    color: '#fff',
    bgColor: '#2563eb',
    sortOrder: 4,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: true,
    },
    accessControl: ['admin', 'consultant', 'endUser'],
  },
  {
    id: 'planning',
    name: '5-Planning',
    description: 'Scheduled or planned work — no immediate urgency, tracked for future sprints',
    color: '#fff',
    bgColor: '#0f766e',
    sortOrder: 5,
    enabledFor: {
      incident: false,
      service_request: true,
      advisory_request: true,
      change_request: false,
      problem_request: false,
      task: true,
    },
    accessControl: ['admin', 'consultant', 'endUser'],
  },
];

const DEFAULT_IMPACTS: ImpactLevel[] = [
  {
    id: 'high',
    name: 'high',
    displayName: '1 - High',
    description: 'Widespread disruption affecting multiple users or core business functions',
    bgColor: '#b91c1c',
    sortOrder: 1,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: '2 - Medium',
    description: 'Partial disruption affecting a team or a non-critical business function',
    bgColor: '#ca8a04',
    sortOrder: 2,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'low',
    name: 'low',
    displayName: '3 - Low',
    description: 'Minimal disruption, isolated to a single user or workaround available',
    bgColor: '#15803d',
    sortOrder: 3,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
];

const DEFAULT_URGENCIES: UrgencyLevel[] = [
  {
    id: 'high',
    name: 'high',
    displayName: '1 - High',
    description: 'Immediate resolution required — time-critical situation',
    bgColor: '#b91c1c',
    sortOrder: 1,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: '2 - Medium',
    description: 'Should be resolved within hours — significant business pressure',
    bgColor: '#ca8a04',
    sortOrder: 2,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'low',
    name: 'low',
    displayName: '3 - Low',
    description: 'Can wait until next available window — low time sensitivity',
    bgColor: '#15803d',
    sortOrder: 3,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
];

const DEFAULT_MATRIX: ExtendedMatrixMap = {
  high: {
    high: { priorityId: 'critical' },
    medium: { priorityId: 'high' },
    low: { priorityId: 'medium' },
  },
  medium: {
    high: { priorityId: 'high' },
    medium: { priorityId: 'medium' },
    low: { priorityId: 'low' },
  },
  low: {
    high: { priorityId: 'medium' },
    medium: { priorityId: 'low' },
    low: { priorityId: 'planning' },
  },
};

const Priorities = () => {
  const { classes } = useStyles();
  const { success } = useNotification();
  const { priorities: apiPriorities, ticketTypeKeys, saveSection, isLoading } = useConfiguration();
  const { ticketTypes } = useSharedTicketTypes();

  const ticketTypeNames = Object.fromEntries(ticketTypes.map((t) => [t.type, t.name]));

  const [priorities, setPriorities] = useState<PriorityLevel[]>(DEFAULT_PRIORITIES);
  const [impacts, setImpacts] = useState<ImpactLevel[]>(DEFAULT_IMPACTS);
  const [urgencies, setUrgencies] = useState<UrgencyLevel[]>(DEFAULT_URGENCIES);
  const [matrices, setMatrices] = useState<Record<string, IConfigMatrixMap>>({});
  const [simplePriorities, setSimplePriorities] = useState<
    Record<string, IConfigSimplePrioritiesBucket> | undefined
  >(undefined);

  useEffect(() => {
    if (!apiPriorities) return;
    setPriorities(apiPriorities.levels as PriorityLevel[]);
    setImpacts(apiPriorities.impactLevels as ImpactLevel[]);
    setUrgencies(apiPriorities.urgencyLevels as UrgencyLevel[]);
    setMatrices(apiPriorities.matrices as Record<string, IConfigMatrixMap>);
    setSimplePriorities(apiPriorities.simplePriorities);
  }, [apiPriorities]);

  const persistPriorities = async (
    levels: PriorityLevel[],
    impactLevels: ImpactLevel[],
    urgencyLevels: UrgencyLevel[],
    mats: Record<string, IConfigMatrixMap>,
    simple?: Record<string, IConfigSimplePrioritiesBucket>,
  ) => {
    await saveSection('priorities', {
      levels,
      impactLevels,
      urgencyLevels,
      matrices: mats,
      simplePriorities: simple,
    });
  };

  const activeTicketTypeColumns = ticketTypeKeys.length
    ? ticketTypeKeys.map((key) => ({
        key,
        label: ticketTypeNames[key] ?? TICKET_TYPE_MATRIX_CONFIG[key]?.label ?? key,
      }))
    : TICKET_TYPE_COLUMNS.map((c) => ({ key: c.key, label: c.label }));

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedPriorityId, setSelectedPriorityId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | null>(null);

  const handleDeletePriority = () => {
    if (selectedPriorityId) {
      const next = priorities.filter((p) => p.id !== selectedPriorityId);
      setPriorities(next);
      persistPriorities(next, impacts, urgencies, matrices, simplePriorities);
      success('Priority deleted successfully');
      setSelectedPriorityId(null);
      setSelectedPriority(null);
    }
    setConfirmDeleteOpen(false);
  };

  const updateMatrix = (
    ticketType: string,
    impact: string,
    urgency: string,
    priorityId: string,
  ) => {
    setMatrices((prev) => {
      const next = {
        ...prev,
        [ticketType]: {
          ...(prev[ticketType] ?? {}),
          [impact]: {
            ...(prev[ticketType]?.[impact] ?? {}),
            [urgency]: {
              ...(prev[ticketType]?.[impact]?.[urgency] ?? {}),
              priorityId,
            },
          },
        },
      };
      persistPriorities(priorities, impacts, urgencies, next, simplePriorities);
      return next;
    });
  };

  const updateMatrixCell = (
    ticketType: string,
    impact: string,
    urgency: string,
    data: MatrixCellData,
  ) => {
    setMatrices((prev) => {
      const next = {
        ...prev,
        [ticketType]: {
          ...(prev[ticketType] ?? {}),
          [impact]: {
            ...(prev[ticketType]?.[impact] ?? {}),
            [urgency]: {
              ...(prev[ticketType]?.[impact]?.[urgency] ?? { priorityId: '' }),
              ...data,
            },
          },
        },
      };
      persistPriorities(priorities, impacts, urgencies, next, simplePriorities);
      return next;
    });
  };

  const resetMatrixForType = (ticketType: string, newMatrix: ExtendedMatrixMap) => {
    setMatrices((prev) => {
      const next: Record<string, IConfigMatrixMap> = {
        ...prev,
        [ticketType]: newMatrix,
      };
      persistPriorities(priorities, impacts, urgencies, next, simplePriorities);
      return next;
    });
  };

  const replaceSimplePriorities = (next: Record<string, IConfigSimplePrioritiesBucket>) => {
    setSimplePriorities(next);
    persistPriorities(priorities, impacts, urgencies, matrices, next);
  };

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Priorities Configuration...'>
        <PrioritiesSection
          priorities={priorities}
          setPriorities={setPriorities}
          onPersist={(next) =>
            persistPriorities(next, impacts, urgencies, matrices, simplePriorities)
          }
          activeTicketTypeColumns={activeTicketTypeColumns}
          selectedPriorityId={selectedPriorityId}
          setSelectedPriorityId={setSelectedPriorityId}
          setSelectedPriority={setSelectedPriority}
        />

        <ImpactSection
          items={impacts}
          onAdd={async (data) => {
            const id =
              (data.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') ||
              `impact_${Date.now()}`;
            const newItem: ImpactLevel = {
              id,
              name: id,
              displayName: data.displayName ?? id,
              description: data.description ?? '',
              bgColor: data.bgColor ?? '#2563eb',
              sortOrder: impacts.length + 1,
              isActive: data.isActive ?? true,
              enabledFor:
                data.enabledFor ??
                Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
            };
            const next = [...impacts, newItem];
            setImpacts(next);
            await persistPriorities(priorities, next, urgencies, matrices, simplePriorities);
          }}
          onEdit={async (id, data) => {
            const next = impacts.map((i) => (i.id === id ? { ...i, ...data } : i));
            setImpacts(next);
            await persistPriorities(priorities, next, urgencies, matrices, simplePriorities);
          }}
          onDelete={async (id) => {
            const next = impacts.filter((i) => i.id !== id);
            setImpacts(next);
            await persistPriorities(priorities, next, urgencies, matrices, simplePriorities);
          }}
          activeTicketTypeColumns={activeTicketTypeColumns}
          isLoading={isLoading}
        />

        <UrgencySection
          items={urgencies}
          onAdd={async (data) => {
            const id =
              (data.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') ||
              `urgency_${Date.now()}`;
            const newItem: UrgencyLevel = {
              id,
              name: id,
              displayName: data.displayName ?? id,
              description: data.description ?? '',
              bgColor: data.bgColor ?? '#2563eb',
              sortOrder: urgencies.length + 1,
              isActive: data.isActive ?? true,
              enabledFor:
                data.enabledFor ??
                Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
            };
            const next = [...urgencies, newItem];
            setUrgencies(next);
            await persistPriorities(priorities, impacts, next, matrices, simplePriorities);
          }}
          onEdit={async (id, data) => {
            const next = urgencies.map((u) => (u.id === id ? { ...u, ...data } : u));
            setUrgencies(next);
            await persistPriorities(priorities, impacts, next, matrices, simplePriorities);
          }}
          onDelete={async (id) => {
            const next = urgencies.filter((u) => u.id !== id);
            setUrgencies(next);
            await persistPriorities(priorities, impacts, next, matrices, simplePriorities);
          }}
          activeTicketTypeColumns={activeTicketTypeColumns}
          isLoading={isLoading}
        />

        <TicketMatrixSection
          ticketTypes={activeTicketTypeColumns.map(({ key }) => {
            const name = ticketTypeNames[key] ?? TICKET_TYPE_MATRIX_CONFIG[key]?.label ?? key;
            const cfg = TICKET_TYPE_MATRIX_CONFIG[key] ?? {
              label: name,
              pluralLabel: name,
              accentColor: '#0369a1',
              Icon: TuneIcon,
            };
            return { key, ...cfg };
          })}
          priorities={priorities}
          impacts={impacts}
          urgencies={urgencies}
          matrices={matrices}
          simplePriorities={simplePriorities}
          onMatrixChange={updateMatrix}
          onMatrixReset={resetMatrixForType}
          onMatrixCellUpdate={updateMatrixCell}
          onSimplePrioritiesChange={replaceSimplePriorities}
        />

        <ConfigDeleteDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDeletePriority}
          entityName='Priority'
          itemName={selectedPriority?.name}
        />
      </ConfigurationSection>
    </Box>
  );
};

export default Priorities;
