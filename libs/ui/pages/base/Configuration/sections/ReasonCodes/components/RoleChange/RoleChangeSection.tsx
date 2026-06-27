import { useState, useEffect } from 'react';
import { IConfigRoleChangeReasonCode } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { ROLE_CHANGE_CONFIG, roleChangeColumns } from '../shared/ReasonCodesPanelConfig';
import { validateRoleChangeDuplicate } from './validateRoleChange';

interface RoleChangeSectionProps {
  data?: IConfigRoleChangeReasonCode[];
  onDataChange?: (data: IConfigRoleChangeReasonCode[]) => void;
}

const RoleChangeSection = ({ data, onDataChange }: RoleChangeSectionProps) => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigRoleChangeReasonCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (reasonCodes?.roleChangeReasonCodes) {
      setRows(reasonCodes.roleChangeReasonCodes);
    }
  }, [data, reasonCodes]);

  const handleSave = (next: IConfigRoleChangeReasonCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('reasonCodes', {
        ...reasonCodes,
        roleChangeReasonCodes: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={ROLE_CHANGE_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={roleChangeColumns as any}
        variant='plain'
        defaultExpanded={false}
        validateFields={validateRoleChangeDuplicate as never}
      />
    </div>
  );
};

export { RoleChangeSection };
