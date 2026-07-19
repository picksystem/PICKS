import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogContent,
  DialogActions,
  alpha,
  darken,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { ITicketType } from '@serviceops/interfaces';
import { useUpdateTicketTypeMutation } from '@serviceops/services';
import { useNotification } from '@serviceops/hooks';
import {
  ITicketTypeLayoutConfig,
  getDefaultLayoutConfig,
  mergeLayoutConfig,
  INFO_BAR_FIELDS,
  SIDE_BAR_SECTION_FIELDS,
  TICKET_OPTIONS_FIELDS,
  ASSIGNMENT_FIELDS,
  CONTACT_AND_BILLING_FIELDS,
  REPORTING_FIELDS,
  DATES_AND_USERS_FIELDS,
  ADDITIONAL_FIELDS_FIELDS,
} from '@serviceops/tickettypelayout';
import FieldTransferList from '../../shared/FieldTransferList/FieldTransferList';

const ACCENT = '#0369a1';

export interface TicketTypeLayoutDialogProps {
  open: boolean;
  ticketType: ITicketType | null;
  onClose: () => void;
  onSave?: () => void;
}

const sectionAccordionSx = {
  boxShadow: 'none',
  border: '1px solid rgba(226, 232, 255, 0.9)',
  borderRadius: '10px !important',
  mb: 1.25,
  '&::before': { display: 'none' },
  '& .MuiAccordionSummary-content': { margin: '10px 0' },
};

type SectionKey =
  | 'sideBar'
  | 'ticketOptions'
  | 'assignment'
  | 'contactAndBilling'
  | 'reporting'
  | 'datesAndUsers'
  | 'additionalFields';

const SECTION_DEFS: { key: SectionKey; title: string; fields: { key: string; label: string }[] }[] =
  [
    { key: 'sideBar', title: 'Side bar', fields: SIDE_BAR_SECTION_FIELDS },
    { key: 'ticketOptions', title: 'Ticket Options', fields: TICKET_OPTIONS_FIELDS },
    { key: 'assignment', title: 'Side-tab Assignment', fields: ASSIGNMENT_FIELDS },
    {
      key: 'contactAndBilling',
      title: 'Side tab-Contact and Billing',
      fields: CONTACT_AND_BILLING_FIELDS,
    },
    { key: 'reporting', title: 'Side tab-Reporting', fields: REPORTING_FIELDS },
    { key: 'datesAndUsers', title: 'Side tab-Date and users', fields: DATES_AND_USERS_FIELDS },
    {
      key: 'additionalFields',
      title: 'Side tab-Additional fields',
      fields: ADDITIONAL_FIELDS_FIELDS,
    },
  ];

export const TicketTypeLayoutDialog = ({
  open,
  ticketType,
  onClose,
  onSave,
}: TicketTypeLayoutDialogProps) => {
  const [config, setConfig] = useState<ITicketTypeLayoutConfig>(getDefaultLayoutConfig);
  const [updateTicketType, { isLoading: isSaving }] = useUpdateTicketTypeMutation();
  const { error: notifyError } = useNotification();

  useEffect(() => {
    if (open && ticketType) {
      setConfig(mergeLayoutConfig(ticketType.layoutConfig));
    }
  }, [open, ticketType]);

  const handleSave = async () => {
    if (!ticketType) return;
    try {
      await updateTicketType({ id: ticketType.id, data: { layoutConfig: config } }).unwrap();
      onSave?.();
      onClose();
    } catch {
      notifyError('Failed to save ticket detail screen layout');
    }
  };

  const updateSection = (key: SectionKey, selectedFields: string[]) => {
    setConfig((prev) => ({ ...prev, [key]: { selectedFields } }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      disableEscapeKeyDown
      disableEnforceFocus
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: `linear-gradient(135deg, ${darken(ACCENT, 0.18)} 0%, ${ACCENT} 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ViewQuiltIcon sx={{ color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            Ticket Detail Screen Layout
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
            {ticketType
              ? `Choose which fields appear on the ${ticketType.displayName || ticketType.name} ticket detail screen`
              : ''}
          </Typography>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0, overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Accordion
            defaultExpanded
            sx={{ ...sectionAccordionSx, border: `1px solid ${alpha(ACCENT, 0.3)}` }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Ticket info bar</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FieldTransferList
                allFields={INFO_BAR_FIELDS}
                selectedKeys={config.infoBar.selectedFields}
                onChange={(keys) =>
                  setConfig((prev) => ({
                    ...prev,
                    infoBar: { ...prev.infoBar, selectedFields: keys },
                  }))
                }
                maxFields={config.infoBar.maxFields}
                onMaxFieldsChange={(value) =>
                  setConfig((prev) => ({ ...prev, infoBar: { ...prev.infoBar, maxFields: value } }))
                }
              />
            </AccordionDetails>
          </Accordion>

          {SECTION_DEFS.map((section) => (
            <Accordion key={section.key} sx={sectionAccordionSx}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FieldTransferList
                  allFields={section.fields}
                  selectedKeys={config[section.key].selectedFields}
                  onChange={(keys) => updateSection(section.key, keys)}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          onClick={onClose}
          variant='outlined'
          disabled={isSaving}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={isSaving}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketTypeLayoutDialog;
