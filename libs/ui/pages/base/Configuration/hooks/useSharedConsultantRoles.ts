import { useGetConfigurationQuery } from '@serviceops/services';
import type { IConfigUserConsultantRole } from '@serviceops/interfaces';

export interface ConsultantRoleOption {
  application: string;
  consultantRole: string;
}

/**
 * Shared hook for the Consultant Roles list (User Management > Consultant
 * Roles > Define consultant roles). Mirrors the convention used by
 * `useSharedServiceLines` / `useSharedApplications` — reads from the cached
 * configuration query rather than issuing its own fetch.
 */
export const useSharedConsultantRoles = () => {
  const { data: configData, isLoading } = useGetConfigurationQuery();

  const consultantRoles: IConfigUserConsultantRole[] =
    configData?.data?.userManagement?.consultantRoles ?? [];

  const options: ConsultantRoleOption[] = consultantRoles.map((r) => ({
    application: r.application ?? '',
    consultantRole: r.consultantRole ?? '',
  }));

  return { consultantRoles, options, isLoading };
};
