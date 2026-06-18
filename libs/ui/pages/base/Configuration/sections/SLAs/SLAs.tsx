import { useState, useEffect, useRef } from 'react';
import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { useConfiguration } from '@serviceops/confighooks';
import { useSharedTicketTypes } from '../../hooks/useSharedTicketTypes';
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
import { ConfigurationSection } from '@serviceops/configsection';

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

const DEFAULT_ACK_VALUES: Record<
  string,
  { activation: boolean; p1: string; p2: string; p3: string; p4: string; p5: string }
> = {
  incident: { activation: true, p1: '00:15', p2: '00:30', p3: '01:00', p4: '04:00', p5: '08:00' },
  service_request: {
    activation: true,
    p1: '00:30',
    p2: '01:00',
    p3: '02:00',
    p4: '08:00',
    p5: '16:00',
  },
  advisory_request: {
    activation: false,
    p1: '01:00',
    p2: '02:00',
    p3: '04:00',
    p4: '16:00',
    p5: '32:00',
  },
};

const DEFAULT_RES_VALUES: Record<
  string,
  { activation: boolean; p1: string; p2: string; p3: string; p4: string; p5: string }
> = {
  incident: { activation: true, p1: '04:00', p2: '08:00', p3: '16:00', p4: '24:00', p5: '48:00' },
  service_request: {
    activation: true,
    p1: '08:00',
    p2: '16:00',
    p3: '24:00',
    p4: '48:00',
    p5: '96:00',
  },
  advisory_request: {
    activation: false,
    p1: '16:00',
    p2: '24:00',
    p3: '48:00',
    p4: '96:00',
    p5: '168:00',
  },
};

const DEFAULT_DUEDATE_VALUES: Record<
  string,
  { activation: boolean; p1: string; p2: string; p3: string; p4: string; p5: string }
> = {
  incident: { activation: true, p1: '08:00', p2: '16:00', p3: '24:00', p4: '48:00', p5: '72:00' },
  service_request: {
    activation: true,
    p1: '16:00',
    p2: '24:00',
    p3: '48:00',
    p4: '72:00',
    p5: '120:00',
  },
  advisory_request: {
    activation: false,
    p1: '24:00',
    p2: '48:00',
    p3: '72:00',
    p4: '120:00',
    p5: '168:00',
  },
};

const SLAs = () => {
  const { classes } = useStyles();
  const { slas: apiSlas, saveSection } = useConfiguration();
  const { ticketTypes: ticketTypesData } = useSharedTicketTypes();

  const activeTicketTypes: ITicketType[] =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  const [ctrl, setCtrl] = useState<IConfigSLAAdminControls>(DEFAULT_CONTROLS);
  const [ackRows, setAckRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [resRows, setResRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [dueDateRows, setDueDateRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [etaActRows, setEtaActRows] = useState<IConfigActivationRow[]>([]);
  const [timeLogActRows, setTimeLogActRows] = useState<IConfigActivationRow[]>([]);

  // Track which row ids we've already synced so a stale refetch (the PATCH
  // invalidates the RTK tag and the new fetch returns BEFORE the DB has
  // committed the optimistic update) doesn't clobber the just-saved values
  // in our local state. Same pattern as ReleaseCycleStatusesSection.
  const lastSyncedIdsRef = useRef<{
    ackRows: Set<string>;
    resRows: Set<string>;
    dueDateRows: Set<string>;
    etaActRows: Set<string>;
    timeLogActRows: Set<string>;
  }>({
    ackRows: new Set(),
    resRows: new Set(),
    dueDateRows: new Set(),
    etaActRows: new Set(),
    timeLogActRows: new Set(),
  });

  useEffect(() => {
    if (!apiSlas) return;

    const trySync = <T extends { id: string }>(
      incoming: T[] | undefined,
      current: T[],
      key: keyof typeof lastSyncedIdsRef.current,
      setter: (next: T[]) => void,
    ) => {
      if (!incoming) return;
      const apiIds = new Set(incoming.map((r) => r.id));
      const known = lastSyncedIdsRef.current[key];
      const everyKnownPresent = known.size === 0 || Array.from(known).every((id) => apiIds.has(id));
      if (!everyKnownPresent && current.length > 0) {
        // API hasn't caught up to our just-saved rows yet. Hold off.
        return;
      }
      // When the API does have our just-saved ids, the refetch can still
      // return stale content (DB write hasn't been observed by this read).
      // Compare each known row's content to detect the stale-refetch case and
      // preserve the local row when it differs.
      const localById = new Map(current.map((r) => [r.id, r]));
      const merged: T[] = incoming.map((apiRow) => {
        if (!known.has(apiRow.id)) return apiRow;
        const localRow = localById.get(apiRow.id);
        if (!localRow) return apiRow;
        if (JSON.stringify(localRow) === JSON.stringify(apiRow)) return apiRow;
        return localRow;
      });
      // Keep any local rows missing from the API (e.g. server replaced a
      // temp id with a real one — the new id will appear on the next refetch).
      const mergedIds = new Set(merged.map((r) => r.id));
      for (const localRow of current) {
        if (!mergedIds.has(localRow.id)) merged.push(localRow);
      }
      setter(merged);
      lastSyncedIdsRef.current[key] = new Set(merged.map((r) => r.id));
    };

    if (apiSlas.adminControls) setCtrl(apiSlas.adminControls);
    trySync(apiSlas.responseAckRows, ackRows, 'ackRows', setAckRows);
    trySync(apiSlas.resolutionRows, resRows, 'resRows', setResRows);
    trySync(apiSlas.dueDateRows, dueDateRows, 'dueDateRows', setDueDateRows);
    trySync(apiSlas.etaActivationRows, etaActRows, 'etaActRows', setEtaActRows);
    trySync(apiSlas.timeLogActivationRows, timeLogActRows, 'timeLogActRows', setTimeLogActRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Display rows computation. The GenericPanel form's `ticketTypeSearch`
  // field returns ticketTypeId as a string (see TicketTypeSearchField.handleSelect),
  // so rows that come from the form have a string ticketTypeId while rows
  // that come from the API have a number. A strict `===` comparison would
  // miss the just-saved row and the table would not reflect the change.
  const matchByTicketTypeId = (row: {
    ticketTypeId?: number | string;
  }): ((r: { ticketTypeId?: number | string }) => boolean) => {
    const key = String(row.ticketTypeId ?? '');
    return (r) => String(r.ticketTypeId ?? '') === key;
  };

  // Only show rows for ticket types that have a stored config — deleting
  // a row should make the ticket type disappear from the table entirely
  // (not fall back to defaults). The defaults are still used by the rest
  // of the app at runtime, but the user can re-add a row via the New
  // button if they want a non-default config.
  const displayAckRows: IConfigResponseAckSLARow[] = activeTicketTypes.flatMap((tt) => {
    const stored = ackRows.find(matchByTicketTypeId({ ticketTypeId: tt.id }));
    if (!stored) return [];
    const def = DEFAULT_ACK_VALUES[tt.type] ?? {
      activation: true,
      p1: '00:15',
      p2: '00:30',
      p3: '01:00',
      p4: '04:00',
      p5: '08:00',
    };
    const isActive = stored.isActive ?? stored.activation ?? def.activation;
    return [
      {
        id: stored.id,
        ticketTypeId: tt.id,
        ticketTypeName: tt.name || tt.displayName,
        activation: isActive,
        isActive,
        shortDescription: stored.shortDescription ?? '',
        internalNote: stored.internalNote ?? '',
        p1: stored.p1 ?? def.p1,
        p2: stored.p2 ?? def.p2,
        p3: stored.p3 ?? def.p3,
        p4: stored.p4 ?? def.p4,
        p5: stored.p5 ?? def.p5,
      } as IConfigResponseAckSLARow,
    ];
  });

  const displayResRows: IConfigResponseAckSLARow[] = activeTicketTypes.flatMap((tt) => {
    const stored = resRows.find(matchByTicketTypeId({ ticketTypeId: tt.id }));
    if (!stored) return [];
    const def = DEFAULT_RES_VALUES[tt.type] ?? {
      activation: true,
      p1: '04:00',
      p2: '08:00',
      p3: '16:00',
      p4: '24:00',
      p5: '48:00',
    };
    return [
      {
        id: stored.id,
        ticketTypeId: tt.id,
        ticketTypeName: tt.name || tt.displayName,
        activation: stored.activation ?? def.activation,
        shortDescription: stored.shortDescription ?? '',
        internalNote: stored.internalNote ?? '',
        p1: stored.p1 ?? def.p1,
        p2: stored.p2 ?? def.p2,
        p3: stored.p3 ?? def.p3,
        p4: stored.p4 ?? def.p4,
        p5: stored.p5 ?? def.p5,
      } as IConfigResponseAckSLARow,
    ];
  });

  const displayDueDateRows: IConfigResponseAckSLARow[] = activeTicketTypes.flatMap((tt) => {
    const stored = dueDateRows.find(matchByTicketTypeId({ ticketTypeId: tt.id }));
    if (!stored) return [];
    const def = DEFAULT_DUEDATE_VALUES[tt.type] ?? {
      activation: true,
      p1: '08:00',
      p2: '16:00',
      p3: '24:00',
      p4: '48:00',
      p5: '72:00',
    };
    return [
      {
        id: stored.id,
        ticketTypeId: tt.id,
        ticketTypeName: tt.name || tt.displayName,
        activation: stored.activation ?? def.activation,
        shortDescription: stored.shortDescription ?? '',
        internalNote: stored.internalNote ?? '',
        p1: stored.p1 ?? def.p1,
        p2: stored.p2 ?? def.p2,
        p3: stored.p3 ?? def.p3,
        p4: stored.p4 ?? def.p4,
        p5: stored.p5 ?? def.p5,
      } as IConfigResponseAckSLARow,
    ];
  });

  const displayEtaActRows: IConfigActivationRow[] = activeTicketTypes.flatMap((tt) => {
    const stored = etaActRows.find(matchByTicketTypeId({ ticketTypeId: tt.id }));
    if (!stored) return [];
    return [
      {
        id: stored.id,
        ticketTypeId: tt.id,
        ticketTypeName: tt.name || tt.displayName,
        activation: stored.activation ?? true,
        shortDescription: stored.shortDescription ?? '',
        internalNote: stored.internalNote ?? '',
      } as IConfigActivationRow,
    ];
  });

  const displayTimeLogActRows: IConfigActivationRow[] = activeTicketTypes.flatMap((tt) => {
    const stored = timeLogActRows.find(matchByTicketTypeId({ ticketTypeId: tt.id }));
    if (!stored) return [];
    return [
      {
        id: stored.id,
        ticketTypeId: tt.id,
        ticketTypeName: tt.name || tt.displayName,
        activation: stored.activation ?? true,
        shortDescription: stored.shortDescription ?? '',
        internalNote: stored.internalNote ?? '',
      } as IConfigActivationRow,
    ];
  });

  // Save handlers for GenericPanel onSave callbacks. The `ticketTypeId` is
  // normalized to a number on every save because the form's
  // `ticketTypeSearch` field returns a string. Without this, the row stored
  // in `ackRows` would have a string `ticketTypeId` while rows returned by
  // the API have a number, and downstream consumers (and the
  // ticketTypeName lookup below) would not be able to find them.
  const normalizeTicketTypeId = <T extends { ticketTypeId?: number | string }>(row: T): T => {
    if (row.ticketTypeId === undefined || row.ticketTypeId === null || row.ticketTypeId === '') {
      return row;
    }
    const num = Number(row.ticketTypeId);
    if (Number.isFinite(num)) {
      return { ...row, ticketTypeId: num };
    }
    return row;
  };

  const saveAckRows = (rows: IConfigResponseAckSLARow[]) => {
    const transformedRows = rows.map((row) => {
      const normalized = normalizeTicketTypeId(row) as IConfigResponseAckSLARow;
      // Keep activation and isActive in sync so both the legacy custom dialog
      // and the GenericPanel built-in dialog work without divergence.
      if (normalized.isActive === undefined && normalized.activation !== undefined) {
        normalized.isActive = normalized.activation;
      } else if (normalized.activation === undefined && normalized.isActive !== undefined) {
        normalized.activation = normalized.isActive;
      }
      if (normalized.ticketTypeId && !normalized.ticketTypeName) {
        const tt = ticketTypesData?.find((t) => t.id === normalized.ticketTypeId);
        normalized.ticketTypeName = tt?.name || tt?.displayName || String(normalized.ticketTypeId);
      }
      return normalized;
    });
    setAckRows(transformedRows);
    // Mark the new ids as known so the post-PATCH refetch doesn't clobber
    // our optimistic update.
    lastSyncedIdsRef.current.ackRows = new Set(transformedRows.map((r) => r.id));
    persistSlas(ctrl, transformedRows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const saveResRows = (rows: IConfigResponseAckSLARow[]) => {
    const transformedRows = rows.map((row) => {
      const normalized = normalizeTicketTypeId(row);
      if (normalized.ticketTypeId && !normalized.ticketTypeName) {
        const tt = ticketTypesData?.find((t) => t.id === normalized.ticketTypeId);
        return {
          ...normalized,
          ticketTypeName: tt?.name || tt?.displayName || String(normalized.ticketTypeId),
        };
      }
      return normalized;
    });
    setResRows(transformedRows);
    lastSyncedIdsRef.current.resRows = new Set(transformedRows.map((r) => r.id));
    persistSlas(ctrl, ackRows, transformedRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const saveDueDateRows = (rows: IConfigResponseAckSLARow[]) => {
    const transformedRows = rows.map((row) => {
      const normalized = normalizeTicketTypeId(row);
      if (normalized.ticketTypeId && !normalized.ticketTypeName) {
        const tt = ticketTypesData?.find((t) => t.id === normalized.ticketTypeId);
        return {
          ...normalized,
          ticketTypeName: tt?.name || tt?.displayName || String(normalized.ticketTypeId),
        };
      }
      return normalized;
    });
    setDueDateRows(transformedRows);
    lastSyncedIdsRef.current.dueDateRows = new Set(transformedRows.map((r) => r.id));
    persistSlas(ctrl, ackRows, resRows, transformedRows, etaActRows, timeLogActRows);
  };

  const saveEtaActRows = (rows: IConfigActivationRow[]) => {
    const transformedRows = rows.map((row) => {
      const normalized = normalizeTicketTypeId(row);
      if (normalized.ticketTypeId && !normalized.ticketTypeName) {
        const tt = ticketTypesData?.find((t) => t.id === normalized.ticketTypeId);
        return {
          ...normalized,
          ticketTypeName: tt?.name || tt?.displayName || String(normalized.ticketTypeId),
        };
      }
      return normalized;
    });
    setEtaActRows(transformedRows);
    lastSyncedIdsRef.current.etaActRows = new Set(transformedRows.map((r) => r.id));
    persistSlas(ctrl, ackRows, resRows, dueDateRows, transformedRows, timeLogActRows);
  };

  const saveTimeLogActRows = (rows: IConfigActivationRow[]) => {
    const transformedRows = rows.map((row) => {
      const normalized = normalizeTicketTypeId(row);
      if (normalized.ticketTypeId && !normalized.ticketTypeName) {
        const tt = ticketTypesData?.find((t) => t.id === normalized.ticketTypeId);
        return {
          ...normalized,
          ticketTypeName: tt?.name || tt?.displayName || String(normalized.ticketTypeId),
        };
      }
      return normalized;
    });
    setTimeLogActRows(transformedRows);
    lastSyncedIdsRef.current.timeLogActRows = new Set(transformedRows.map((r) => r.id));
    persistSlas(ctrl, ackRows, resRows, dueDateRows, etaActRows, transformedRows);
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
        <ResponseAckSLASection displayRows={displayAckRows} onDataChange={saveAckRows} />
        <ResolutionSLASection
          displayRows={displayResRows}
          activeTicketTypes={activeTicketTypes}
          onDataChange={saveResRows}
        />
        <DueDateAdminControlsSection ctrl={ctrl} onUpdate={update} />
        <DueDatesSection
          displayRows={displayDueDateRows}
          activeTicketTypes={activeTicketTypes}
          onDataChange={saveDueDateRows}
        />
        <ETAdminControlsSection ctrl={ctrl} onUpdate={update} />
        <ETAActivationSection
          displayRows={displayEtaActRows}
          activeTicketTypes={activeTicketTypes}
          onDataChange={saveEtaActRows}
        />
        <TimeLogAdminControlsSection ctrl={ctrl} onUpdate={update} />
        <TimeLogsActivationSection
          displayRows={displayTimeLogActRows}
          activeTicketTypes={activeTicketTypes}
          onDataChange={saveTimeLogActRows}
        />
      </ConfigurationSection>
    </Box>
  );
};

export default SLAs;
