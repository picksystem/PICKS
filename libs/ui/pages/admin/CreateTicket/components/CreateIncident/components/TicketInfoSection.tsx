import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, TextField, Select, Checkbox, Button } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from '../styles';

interface TicketInfoSectionProps {
  ticketNumber: string;
  callerOptions: { value: string; label: string }[];
  caller: string;
  callerTouched: boolean | undefined;
  callerError: string | undefined;
  callerFirstName: string;
  callerLastName: string;
  client: string;
  additionalContacts: string;
  manualCallerOpen: boolean;
  callerEmail: string;
  callerEmailTouched: boolean | undefined;
  callerEmailError: string | undefined;
  callerPhone: string;
  callerDepartment: string;
  callerLocation: string;
  callerReportingManager: string;
  isUpdatingCaller: boolean;
  onClientChange: (v: string) => void;
  onCallerChange: (v: string) => void;
  onCallerBlur: React.FocusEventHandler;
  onAdditionalContactsChange: (v: string) => void;
  onManualCallerToggle: () => void;
  onFieldChange: React.ChangeEventHandler<HTMLInputElement>;
  onFieldBlur: React.FocusEventHandler;
  onManualCallerUpdate: () => void;
}

const TicketInfoSection = ({
  ticketNumber,
  callerOptions,
  caller,
  callerTouched,
  callerError,
  callerFirstName,
  callerLastName,
  client,
  additionalContacts,
  manualCallerOpen,
  callerEmail,
  callerEmailTouched,
  callerEmailError,
  callerPhone,
  callerDepartment,
  callerLocation,
  callerReportingManager,
  isUpdatingCaller,
  onClientChange,
  onCallerChange,
  onCallerBlur,
  onAdditionalContactsChange,
  onManualCallerToggle,
  onFieldChange,
  onFieldBlur,
  onManualCallerUpdate,
}: TicketInfoSectionProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  return (
    <>
      <Typography className={classes.sectionTitle}>Ticket Information</Typography>
      <Box className={classes.formGrid}>
        <TextField
          label='Ticket Number'
          value={ticketNumber}
          disabled
          className={classes.ticketNumber}
        />
        <Select
          label='Client'
          options={callerOptions}
          value={client}
          onChange={(e) => onClientChange(e.target.value as string)}
          required
        />
        {callerOptions.length > 0 ? (
          <Select
            label='Caller'
            options={callerOptions}
            value={caller}
            onChange={(e) => onCallerChange(e.target.value as string)}
            onBlur={onCallerBlur}
            error={!!(callerTouched && callerError)}
            errorText={reqError(callerTouched, callerError)}
            required
          />
        ) : (
          <TextField
            name='caller'
            label='Caller'
            value={caller}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            icon={<SearchIcon />}
            iconAlignment='right'
            inputProps={{ maxLength: 50 }}
            error={!!(callerTouched && callerError)}
            errorText={reqError(callerTouched, callerError)}
            required
          />
        )}
        <Select
          label='Additional Contact(s)'
          options={callerOptions}
          value={additionalContacts}
          onChange={(e) => onAdditionalContactsChange(e.target.value as string)}
        />
      </Box>

      {/* ── Can't find in the list? Update manually ────────────────────── */}
      <Box className={classes.manualCallerSection}>
        <Checkbox
          label="Can't find in the list? Update manually"
          checked={manualCallerOpen}
          onChange={onManualCallerToggle}
        />
        {manualCallerOpen && (
          <Box className={classes.manualCallerFields}>
            <Box className={classes.formGrid}>
              <TextField
                name='callerFirstName'
                label='First Name'
                value={callerFirstName}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                inputProps={{ maxLength: 30 }}
                required
              />
              <TextField
                name='callerLastName'
                label='Last Name / Family Name'
                value={callerLastName}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                inputProps={{ maxLength: 30 }}
                required
              />
              <TextField
                name='callerEmail'
                label='Work Email'
                value={callerEmail}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                type='email'
                inputProps={{ maxLength: 60 }}
                error={!!(callerEmailTouched && callerEmailError)}
                errorText={reqError(callerEmailTouched, callerEmailError)}
                required
              />
              <TextField
                name='callerPhone'
                label='Phone Number'
                value={callerPhone}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                type='tel'
                inputProps={{ maxLength: 20 }}
              />
              <TextField
                name='callerLocation'
                label='Work Location'
                value={callerLocation}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                icon={<SearchIcon />}
                iconAlignment='right'
                inputProps={{ maxLength: 50 }}
                required
              />
              <TextField
                name='callerDepartment'
                label='Department'
                value={callerDepartment}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                icon={<SearchIcon />}
                iconAlignment='right'
                inputProps={{ maxLength: 50 }}
              />
              {/* Reporting Manager + action buttons on the same row */}
              <TextField
                name='callerReportingManager'
                label='Reporting Manager'
                value={callerReportingManager}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                icon={<SearchIcon />}
                iconAlignment='right'
                inputProps={{ maxLength: 50 }}
                required
              />
              <Box
                sx={{
                  gridColumn: { xs: '1 / -1', sm: '2 / -1' },
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  gap: 1,
                  pb: 0.25,
                  flexDirection: { xs: 'column', sm: 'row' },
                  '& .MuiButton-root': {
                    width: { xs: '100%', sm: 'auto' },
                  },
                }}
              >
                <Button
                  variant='outlined'
                  color='error'
                  onClick={onManualCallerToggle}
                  disabled={isUpdatingCaller}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={onManualCallerUpdate}
                  disabled={isUpdatingCaller}
                  loading={isUpdatingCaller}
                >
                  Update
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default TicketInfoSection;
