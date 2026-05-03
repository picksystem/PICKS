import { useCallback } from 'react';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
  useUpdateConfigurationMutation,
} from '@serviceops/services';
import {
  IConfigurationData,
  IConfigPriorities,
  IConfigGeneral,
  IConfigStatuses,
  IConfigSLAs,
  IConfigCategorization,
  IConfigConsultantProfiles,
  IConfigApprovals,
  IConfigTicketUpdateTemplates,
  IConfigCommentTemplates,
  IConfigInternalNoteTemplates,
  IConfigResolutionTemplates,
  IConfigTimeEntryTemplates,
  IConfigUserConfig,
  IConfigReasonCodes,
  IConfigTimesheets,
  IConfigExpenses,
  IConfigCalendars,
  DEFAULT_CONFIGURATION_DATA,
} from '@serviceops/interfaces';

/**
 * Central hook consumed by every Configuration section.
 *
 * - `config`          – full IConfiguration object from the API
 * - `priorities`      – shorthand for config.data.priorities (ticket-type-aware)
 * - `general`         – shorthand for config.data.general
 * - `statuses`        – shorthand for config.data.statuses
 * - `slas`            – shorthand for config.data.slas
 * - `ticketTypeKeys`  – ordered list of active ticket type keys (from priorities.matrices keys)
 * - `saveSection`     – PATCH one named section without touching others
 * - `saveAll`         – PUT the complete configuration document
 * - `isLoading`       – query loading state
 * - `isSaving`        – mutation in-flight state
 */
export const useConfiguration = () => {
  const { data: config, isLoading, error } = useGetConfigurationQuery();
  const [patchSection, { isLoading: isPatchLoading }] = useUpdateConfigurationSectionMutation();
  const [putAll, { isLoading: isPutLoading }] = useUpdateConfigurationMutation();

  const data: IConfigurationData = config?.data ?? DEFAULT_CONFIGURATION_DATA;

  // Derive the active ticket type keys from the matrices object (enriched by backend)
  const ticketTypeKeys: string[] = Object.keys(data.priorities.matrices);

  const saveSection = useCallback(
    <K extends keyof IConfigurationData>(section: K, value: IConfigurationData[K]) =>
      patchSection({ section, value }),
    [patchSection],
  );

  const saveAll = useCallback((fullData: IConfigurationData) => putAll(fullData), [putAll]);

  return {
    config,
    data,
    general: data.general as IConfigGeneral,
    priorities: data.priorities as IConfigPriorities,
    statuses: data.statuses as IConfigStatuses,
    releaseStatuses: data.releaseStatuses as IConfigStatuses,
    slas: data.slas as IConfigSLAs,
    categorization: data.categorization as IConfigCategorization,
    consultantProfiles: data.consultantProfiles as IConfigConsultantProfiles,
    approvals: data.approvals as IConfigApprovals,
    ticketUpdateTemplates: data.ticketUpdateTemplates as IConfigTicketUpdateTemplates,
    commentTemplates: data.commentTemplates as IConfigCommentTemplates,
    internalNoteTemplates: data.internalNoteTemplates as IConfigInternalNoteTemplates,
    resolutionTemplates: data.resolutionTemplates as IConfigResolutionTemplates,
    timeEntryTemplates: data.timeEntryTemplates as IConfigTimeEntryTemplates,
    userConfig: data.userConfig as IConfigUserConfig,
    reasonCodes: data.reasonCodes as IConfigReasonCodes,
    timesheets: data.timesheets as IConfigTimesheets,
    expenses: data.expenses as IConfigExpenses,
    calendars: data.calendars as IConfigCalendars,
    ticketTypeKeys,
    saveSection,
    saveAll,
    isLoading,
    isSaving: isPatchLoading || isPutLoading,
    error,
  };
};
