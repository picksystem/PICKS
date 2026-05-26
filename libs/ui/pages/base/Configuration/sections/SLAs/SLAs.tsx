import React, { useState, useEffect } from 'react';
import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';
import {
  IConfigSLAAdminControls,
  IConfigResponseAckSLARow,
  IConfigActivationRow,
  ITicketType,
} from '@serviceops/interfaces';
import { SLASettingsSection } from './components/SLASettings/SLASettingsSection';
import { CalendarRulesSection } from './components/CalendarRules/CalendarRulesSection';
import { ResponseAckSLASection } from './components/ResponseAckSLA/ResponseAckSLASection';
import { ResolutionSLASection } from './components/ResolutionSLA/ResolutionSLASection';
import { DueDateAdminControlsSection } from './components/DueDateAdminControls/DueDateAdminControlsSection';
import { DueDatesSection } from './components/DueDates/DueDatesSection';
import { ETAdminControlsSection } from './components/ETAdminControls/ETAdminControlsSection';
import { ETAActivationSection } from './components/ETAActivation/ETAActivationSection';
import { TimeLogAdminControlsSection } from './components/TimeLogAdminControls/TimeLogAdminControlsSection';
import { TimeLogsActivationSection } from './components/TimeLogsActivation/TimeLogsActivationSection';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';

const DEFAULT_CONTROLS: IConfigSLAAdminControls = {
  enabled: false,
  activateOnTicketTypes: {},
  basedOnCallerCalendar: false,
  basedOnConsultantCalendar: true,
  excludeCallerBankHolidays: false,
  excludeCallerLeaves: false,
  excludeConsultantBankHolidays: true,
  excludeConsultantLeaves: false,
  excludeSaturdaysAndSundays: true,
  excludeFridaysAndSaturdays: false,
  excludeFridaysOnly: false,
  excludeSaturdaysOnly: false,
  excludeSundaysOnly: false,
  responseAckSLAEnabled: true,
  responseAlertOnBreach: true,
  resolutionSLAEnabled: true,
  dueDateAdminEnabled: true,
  dueDateOverrideByAgents: false,
  dueDateEnableDates: true,
  dueDateEditableByConsultants: false,
  dueDateEqualToSLADates: false,
  dueDateExtendDueDates: false,
  dueDatesEnabled: true,
  dueDateVisibleToCallers: true,
  alertBeforeDueDate: true,
  etaEnabled: false,
  etaEditableByConsultants: false,
  etaEqualToDueDates: false,
  etaActivationEnabled: false,
  etaVisibleToCallers: false,
  etaEmailNotifications: false,
  timeLogAdminEnabled: true,
  requireTimeLogsForResolution: false,
  timeLogsActivationEnabled: true,
  showTimeLogsToCallers: false,
};

const FALLBACK_DEFAULTS = { activation: true, p1: 15, p2: 30, p3: 60, p4: 240, p5: 480 };
const FALLBACK_RES = { activation: true, p1: 4, p2: 8, p3: 16, p4: 24, p5: 48 };
const FALLBACK_DUEDATE = { activation: true, p1: 8, p2: 16, p3: 24, p4: 48, p5: 72 };

const DEFAULT_ACK_VALUES: Record<
  string,
  { activation: boolean; p1: number; p2: number; p3: number; p4: number; p5: number }
> = {
  incident: { activation: true, p1: 15, p2: 30, p3: 60, p4: 240, p5: 480 },
  service_request: { activation: true, p1: 30, p2: 60, p3: 120, p4: 480, p5: 960 },
  advisory_request: { activation: false, p1: 60, p2: 120, p3: 240, p4: 960, p5: 1920 },
};

const DEFAULT_RES_VALUES: Record<
  string,
  { activation: boolean; p1: number; p2: number; p3: number; p4: number; p5: number }
> = {
  incident: { activation: true, p1: 4, p2: 8, p3: 16, p4: 24, p5: 48 },
  service_request: { activation: true, p1: 8, p2: 16, p3: 24, p4: 48, p5: 96 },
  advisory_request: { activation: false, p1: 16, p2: 24, p3: 48, p4: 96, p5: 168 },
};

const DEFAULT_DUEDATE_VALUES: Record<
  string,
  { activation: boolean; p1: number; p2: number; p3: number; p4: number; p5: number }
> = {
  incident: { activation: true, p1: 8, p2: 16, p3: 24, p4: 48, p5: 72 },
  service_request: { activation: true, p1: 16, p2: 24, p3: 48, p4: 72, p5: 120 },
  advisory_request: { activation: false, p1: 24, p2: 48, p3: 72, p4: 120, p5: 168 },
};

const SLAs = () => {
  const { classes } = useStyles();
  const { slas: apiSlas, saveSection } = useConfiguration();
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes: ITicketType[] =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  const [ctrl, setCtrl] = useState<IConfigSLAAdminControls>(DEFAULT_CONTROLS);
  const [ackRows, setAckRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [resRows, setResRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [dueDateRows, setDueDateRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [etaActRows, setEtaActRows] = useState<IConfigActivationRow[]>([]);
  const [timeLogActRows, setTimeLogActRows] = useState<IConfigActivationRow[]>([]);

  // Response/Ack state
  const [selectedAckRowId, setSelectedAckRowId] = useState<string | null>(null);
  const [editingAckRow, setEditingAckRow] = useState<IConfigResponseAckSLARow | null>(null);

  // Resolution state
  const [selectedResRowId, setSelectedResRowId] = useState<string | null>(null);
  const [editingResRow, setEditingResRow] = useState<IConfigResponseAckSLARow | null>(null);

  // Due Date state
  const [selectedDueDateRowId, setSelectedDueDateRowId] = useState<string | null>(null);
  const [editingDueDateRow, setEditingDueDateRow] = useState<IConfigResponseAckSLARow | null>(null);

  // ETA Activation state
  const [selectedEtaActRowId, setSelectedEtaActRowId] = useState<string | null>(null);
  const [editingEtaActRow, setEditingEtaActRow] = useState<IConfigActivationRow | null>(null);

  // Time Log Activation state
  const [selectedTimeLogActRowId, setSelectedTimeLogActRowId] = useState<string | null>(null);
  const [editingTimeLogActRow, setEditingTimeLogActRow] = useState<IConfigActivationRow | null>(
    null,
  );

  useEffect(() => {
    if (apiSlas?.adminControls) setCtrl(apiSlas.adminControls);
    if (apiSlas?.responseAckRows) setAckRows(apiSlas.responseAckRows);
    if (apiSlas?.resolutionRows) setResRows(apiSlas.resolutionRows);
    if (apiSlas?.dueDateRows) setDueDateRows(apiSlas.dueDateRows);
    if (apiSlas?.etaActivationRows) setEtaActRows(apiSlas.etaActivationRows);
    if (apiSlas?.timeLogActivationRows) setTimeLogActRows(apiSlas.timeLogActivationRows);
  }, [apiSlas]);

  const persistSlas = (
    nextCtrl: IConfigSLAAdminControls,
    nextAckRows: IConfigResponseAckSLARow[],
    nextResRows: IConfigResponseAckSLARow[],
    nextDueDateRows: IConfigResponseAckSLARow[],
    nextEtaActRows: IConfigActivationRow[],
    nextTimeLogActRows: IConfigActivationRow[],
  ) => {
    saveSection('slas', {
      adminControls: nextCtrl,
      items: apiSlas?.items ?? [],
      responseAckRows: nextAckRows,
      resolutionRows: nextResRows,
      dueDateRows: nextDueDateRows,
      etaActivationRows: nextEtaActRows,
      timeLogActivationRows: nextTimeLogActRows,
    });
  };

  const update = <K extends keyof IConfigSLAAdminControls>(
    key: K,
    value: IConfigSLAAdminControls[K],
  ) => {
    const next = { ...ctrl, [key]: value };
    setCtrl(next);
    persistSlas(next, ackRows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const toggleTicketTypeActivation = (typeKey: string, value: boolean) => {
    const next = {
      ...ctrl,
      activateOnTicketTypes: { ...(ctrl.activateOnTicketTypes ?? {}), [typeKey]: value },
    };
    setCtrl(next);
    persistSlas(next, ackRows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  // Display rows computation
  const displayAckRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
    const stored = ackRows.find((r) => r.ticketTypeId === tt.id);
    const def = DEFAULT_ACK_VALUES[tt.type] ?? FALLBACK_DEFAULTS;
    return {
      id: stored?.id ?? `rack_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? def.activation,
      p1: stored?.p1 ?? def.p1,
      p2: stored?.p2 ?? def.p2,
      p3: stored?.p3 ?? def.p3,
      p4: stored?.p4 ?? def.p4,
      p5: stored?.p5 ?? def.p5,
    };
  });

  const displayResRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
    const stored = resRows.find((r) => r.ticketTypeId === tt.id);
    const def = DEFAULT_RES_VALUES[tt.type] ?? FALLBACK_RES;
    return {
      id: stored?.id ?? `rres_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? def.activation,
      p1: stored?.p1 ?? def.p1,
      p2: stored?.p2 ?? def.p2,
      p3: stored?.p3 ?? def.p3,
      p4: stored?.p4 ?? def.p4,
      p5: stored?.p5 ?? def.p5,
    };
  });

  const displayDueDateRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
    const stored = dueDateRows.find((r) => r.ticketTypeId === tt.id);
    const def = DEFAULT_DUEDATE_VALUES[tt.type] ?? FALLBACK_DUEDATE;
    return {
      id: stored?.id ?? `rdd_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? def.activation,
      p1: stored?.p1 ?? def.p1,
      p2: stored?.p2 ?? def.p2,
      p3: stored?.p3 ?? def.p3,
      p4: stored?.p4 ?? def.p4,
      p5: stored?.p5 ?? def.p5,
    };
  });

  const displayEtaActRows: IConfigActivationRow[] = activeTicketTypes.map((tt) => {
    const stored = etaActRows.find((r) => r.ticketTypeId === tt.id);
    return {
      id: stored?.id ?? `eta_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? true,
    };
  });

  const displayTimeLogActRows: IConfigActivationRow[] = activeTicketTypes.map((tt) => {
    const stored = timeLogActRows.find((r) => r.ticketTypeId === tt.id);
    return {
      id: stored?.id ?? `tlog_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? true,
    };
  });

  // Used IDs
  const usedAckIds = ackRows.map((r) => r.ticketTypeId);
  const usedResIds = resRows.map((r) => r.ticketTypeId);
  const usedDueDateIds = dueDateRows.map((r) => r.ticketTypeId);
  const usedEtaActIds = etaActRows.map((r) => r.ticketTypeId);
  const usedTimeLogActIds = timeLogActRows.map((r) => r.ticketTypeId);

  // Save handlers
  const saveAckRows = (rows: IConfigResponseAckSLARow[]) => {
    setAckRows(rows);
    persistSlas(ctrl, rows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const handleAckSubmit = (row: IConfigResponseAckSLARow) => {
    const existing = ackRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? ackRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...ackRows, row];
    saveAckRows(next);
    setEditingAckRow(null);
    setSelectedAckRowId(row.id);
  };

  const toggleRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const def = DEFAULT_ACK_VALUES[tt?.type ?? ''] ?? FALLBACK_DEFAULTS;
    const existing = ackRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigResponseAckSLARow = existing
      ? { ...existing, activation: value }
      : {
          id: `rack_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          activation: value,
          p1: def.p1,
          p2: def.p2,
          p3: def.p3,
          p4: def.p4,
          p5: def.p5,
        };
    const next = existing
      ? ackRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...ackRows, updated];
    saveAckRows(next);
  };

  const handleAckDelete = () => {
    if (!selectedAckRowId) return;
    const row = displayAckRows.find((r) => r.id === selectedAckRowId);
    if (!row) return;
    const next = ackRows.filter((r) => r.ticketTypeId !== row.ticketTypeId);
    saveAckRows(next);
    setSelectedAckRowId(null);
  };

  const handleAckLoadDefaults = () => {
    const defaultRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
      const def = DEFAULT_ACK_VALUES[tt.type] ?? FALLBACK_DEFAULTS;
      return {
        id: `rack_${tt.type}`,
        ticketTypeId: tt.id,
        ticketTypeName: tt.displayName || tt.name,
        ...def,
      };
    });
    saveAckRows(defaultRows);
    setSelectedAckRowId(null);
  };

  const saveResRows = (rows: IConfigResponseAckSLARow[]) => {
    setResRows(rows);
    persistSlas(ctrl, ackRows, rows, dueDateRows, etaActRows, timeLogActRows);
  };

  const handleResSubmit = (row: IConfigResponseAckSLARow) => {
    const existing = resRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? resRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...resRows, row];
    saveResRows(next);
    setEditingResRow(null);
    setSelectedResRowId(row.id);
  };

  const toggleResRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const def = DEFAULT_RES_VALUES[tt?.type ?? ''] ?? FALLBACK_RES;
    const existing = resRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigResponseAckSLARow = existing
      ? { ...existing, activation: value }
      : {
          id: `rres_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          ...def,
          activation: value,
        };
    const next = existing
      ? resRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...resRows, updated];
    saveResRows(next);
  };

  const handleResDelete = () => {
    if (!selectedResRowId) return;
    const row = displayResRows.find((r) => r.id === selectedResRowId);
    if (!row) return;
    const next = resRows.filter((r) => r.ticketTypeId !== row.ticketTypeId);
    saveResRows(next);
    setSelectedResRowId(null);
  };

  const handleResLoadDefaults = () => {
    const defaultRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
      const def = DEFAULT_RES_VALUES[tt.type] ?? FALLBACK_RES;
      return {
        id: `rres_${tt.type}`,
        ticketTypeId: tt.id,
        ticketTypeName: tt.displayName || tt.name,
        ...def,
      };
    });
    saveResRows(defaultRows);
    setSelectedResRowId(null);
  };

  const saveDueDateRows = (rows: IConfigResponseAckSLARow[]) => {
    setDueDateRows(rows);
    persistSlas(ctrl, ackRows, resRows, rows, etaActRows, timeLogActRows);
  };

  const handleDueDateSubmit = (row: IConfigResponseAckSLARow) => {
    const existing = dueDateRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? dueDateRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...dueDateRows, row];
    saveDueDateRows(next);
    setEditingDueDateRow(null);
    setSelectedDueDateRowId(row.id);
  };

  const toggleDueDateRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const def = DEFAULT_DUEDATE_VALUES[tt?.type ?? ''] ?? FALLBACK_DUEDATE;
    const existing = dueDateRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigResponseAckSLARow = existing
      ? { ...existing, activation: value }
      : {
          id: `rdd_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          ...def,
          activation: value,
        };
    const next = existing
      ? dueDateRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...dueDateRows, updated];
    saveDueDateRows(next);
  };

  const handleDueDateDelete = () => {
    if (!selectedDueDateRowId) return;
    const row = displayDueDateRows.find((r) => r.id === selectedDueDateRowId);
    if (!row) return;
    const next = dueDateRows.filter((r) => r.ticketTypeId !== row.ticketTypeId);
    saveDueDateRows(next);
    setSelectedDueDateRowId(null);
  };

  const handleDueDateLoadDefaults = () => {
    const defaultRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
      const def = DEFAULT_DUEDATE_VALUES[tt.type] ?? FALLBACK_DUEDATE;
      return {
        id: `rdd_${tt.type}`,
        ticketTypeId: tt.id,
        ticketTypeName: tt.displayName || tt.name,
        ...def,
      };
    });
    saveDueDateRows(defaultRows);
    setSelectedDueDateRowId(null);
  };

  const saveEtaActRows = (rows: IConfigActivationRow[]) => {
    setEtaActRows(rows);
    persistSlas(ctrl, ackRows, resRows, dueDateRows, rows, timeLogActRows);
  };

  const handleEtaActSubmit = (row: IConfigActivationRow) => {
    const existing = etaActRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? etaActRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...etaActRows, row];
    saveEtaActRows(next);
    setEditingEtaActRow(null);
    setSelectedEtaActRowId(row.id);
  };

  const toggleEtaActRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const existing = etaActRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigActivationRow = existing
      ? { ...existing, activation: value }
      : {
          id: `eta_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          activation: value,
        };
    const next = existing
      ? etaActRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...etaActRows, updated];
    saveEtaActRows(next);
  };

  const handleEtaActDelete = () => {
    if (!selectedEtaActRowId) return;
    const row = displayEtaActRows.find((r) => r.id === selectedEtaActRowId);
    if (!row) return;
    const next = etaActRows.filter((r) => r.ticketTypeId !== row.ticketTypeId);
    saveEtaActRows(next);
    setSelectedEtaActRowId(null);
  };

  const saveTimeLogActRows = (rows: IConfigActivationRow[]) => {
    setTimeLogActRows(rows);
    persistSlas(ctrl, ackRows, resRows, dueDateRows, etaActRows, rows);
  };

  const handleTimeLogActSubmit = (row: IConfigActivationRow) => {
    const existing = timeLogActRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? timeLogActRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...timeLogActRows, row];
    saveTimeLogActRows(next);
    setEditingTimeLogActRow(null);
    setSelectedTimeLogActRowId(row.id);
  };

  const toggleTimeLogActRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const existing = timeLogActRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigActivationRow = existing
      ? { ...existing, activation: value }
      : {
          id: `tlog_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          activation: value,
        };
    const next = existing
      ? timeLogActRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...timeLogActRows, updated];
    saveTimeLogActRows(next);
  };

  const handleTimeLogActDelete = () => {
    if (!selectedTimeLogActRowId) return;
    const row = displayTimeLogActRows.find((r) => r.id === selectedTimeLogActRowId);
    if (!row) return;
    const next = timeLogActRows.filter((r) => r.ticketTypeId !== row.ticketTypeId);
    saveTimeLogActRows(next);
    setSelectedTimeLogActRowId(null);
  };

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading SLAs Configuration...'>
        <SLASettingsSection
          ctrl={ctrl}
          onUpdate={update}
          activeTicketTypes={activeTicketTypes}
          toggleTicketTypeActivation={toggleTicketTypeActivation}
        />
        <CalendarRulesSection ctrl={ctrl} onUpdate={update} />
        <ResponseAckSLASection
          displayRows={displayAckRows}
          selectedRowId={selectedAckRowId}
          setSelectedRowId={setSelectedAckRowId}
          editingRow={editingAckRow}
          setEditingRow={setEditingAckRow}
          onSubmit={handleAckSubmit}
          onDelete={handleAckDelete}
          onLoadDefaults={handleAckLoadDefaults}
          onToggleActivation={toggleRowActivation}
          activeTicketTypes={activeTicketTypes}
          usedTicketTypeIds={usedAckIds}
        />
        <ResolutionSLASection
          displayRows={displayResRows}
          selectedRowId={selectedResRowId}
          setSelectedRowId={setSelectedResRowId}
          editingRow={editingResRow}
          setEditingRow={setEditingResRow}
          onSubmit={handleResSubmit}
          onDelete={handleResDelete}
          onLoadDefaults={handleResLoadDefaults}
          onToggleActivation={toggleResRowActivation}
          activeTicketTypes={activeTicketTypes}
          usedTicketTypeIds={usedResIds}
        />
        <DueDateAdminControlsSection ctrl={ctrl} onUpdate={update} />
        <DueDatesSection
          displayRows={displayDueDateRows}
          selectedRowId={selectedDueDateRowId}
          setSelectedRowId={setSelectedDueDateRowId}
          editingRow={editingDueDateRow}
          setEditingRow={setEditingDueDateRow}
          onSubmit={handleDueDateSubmit}
          onDelete={handleDueDateDelete}
          onLoadDefaults={handleDueDateLoadDefaults}
          onToggleActivation={toggleDueDateRowActivation}
          activeTicketTypes={activeTicketTypes}
          usedTicketTypeIds={usedDueDateIds}
        />
        <ETAdminControlsSection ctrl={ctrl} onUpdate={update} />
        <ETAActivationSection
          displayRows={displayEtaActRows}
          selectedRowId={selectedEtaActRowId}
          setSelectedRowId={setSelectedEtaActRowId}
          editingRow={editingEtaActRow}
          setEditingRow={setEditingEtaActRow}
          onSubmit={handleEtaActSubmit}
          onDelete={handleEtaActDelete}
          onToggleActivation={toggleEtaActRowActivation}
          activeTicketTypes={activeTicketTypes}
          usedTicketTypeIds={usedEtaActIds}
        />
        <TimeLogAdminControlsSection ctrl={ctrl} onUpdate={update} />
        <TimeLogsActivationSection
          displayRows={displayTimeLogActRows}
          selectedRowId={selectedTimeLogActRowId}
          setSelectedRowId={setSelectedTimeLogActRowId}
          editingRow={editingTimeLogActRow}
          setEditingRow={setEditingTimeLogActRow}
          onSubmit={handleTimeLogActSubmit}
          onDelete={handleTimeLogActDelete}
          onToggleActivation={toggleTimeLogActRowActivation}
          activeTicketTypes={activeTicketTypes}
          usedTicketTypeIds={usedTimeLogActIds}
        />
      </ConfigurationSection>
    </Box>
  );
};

export default SLAs;
