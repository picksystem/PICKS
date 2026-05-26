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

  // Save handlers for GenericPanel onSave callbacks
  const saveAckRows = (rows: IConfigResponseAckSLARow[]) => {
    setAckRows(rows);
    persistSlas(ctrl, rows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const saveResRows = (rows: IConfigResponseAckSLARow[]) => {
    setResRows(rows);
    persistSlas(ctrl, ackRows, rows, dueDateRows, etaActRows, timeLogActRows);
  };

  const saveDueDateRows = (rows: IConfigResponseAckSLARow[]) => {
    setDueDateRows(rows);
    persistSlas(ctrl, ackRows, resRows, rows, etaActRows, timeLogActRows);
  };

  const saveEtaActRows = (rows: IConfigActivationRow[]) => {
    setEtaActRows(rows);
    persistSlas(ctrl, ackRows, resRows, dueDateRows, rows, timeLogActRows);
  };

  const saveTimeLogActRows = (rows: IConfigActivationRow[]) => {
    setTimeLogActRows(rows);
    persistSlas(ctrl, ackRows, resRows, dueDateRows, etaActRows, rows);
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
          activeTicketTypes={activeTicketTypes}
          onDataChange={saveAckRows}
        />
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
