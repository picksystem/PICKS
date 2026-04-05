import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, TextField, Select, Checkbox, Button } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from '../styles';
import { useState, useRef } from 'react';
import { Paper, Popper, MenuItem, MenuList } from '@mui/material';

// ── Searchable Client Field Component ────────────────────────────
interface ClientFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
  classes: any;
}

const ClientSearchField = ({ value, callerOptions, onChange, classes }: ClientFieldProps) => {
  const [searchText, setSearchText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const filteredOptions = callerOptions.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    onChange(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleSelectOption = (option: { value: string; label: string }) => {
    setSearchText(option.label);
    onChange(option.label);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (callerOptions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Box ref={anchorRef} position='relative'>
      <TextField
        name='client'
        label='Client'
        value={searchText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder='Search or select client'
        icon={<SearchIcon />}
        iconAlignment='right'
        inputProps={{ maxLength: 50 }}
        required
      />
      <Popper
        open={isOpen && filteredOptions.length > 0}
        anchorEl={anchorRef.current}
        placement='bottom-start'
        style={{ width: anchorRef.current?.offsetWidth, zIndex: 1000 }}
      >
        <Paper elevation={3}>
          <MenuList>
            {filteredOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSelectOption(option)}
                selected={searchText === option.label}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  );
};

// ── Searchable User Field Component ──────────────────────────
interface UserFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur: React.FocusEventHandler;
  error: boolean;
  errorText?: string | React.ReactNode;
  label: string;
}

const UserSearchField = ({
  value,
  callerOptions,
  onChange,
  onBlur,
  error,
  errorText,
  label,
}: UserFieldProps) => {
  const [searchText, setSearchText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const filteredOptions = callerOptions.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    onChange(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleSelectOption = (option: { value: string; label: string }) => {
    setSearchText(option.label);
    onChange(option.label);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (callerOptions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Box ref={anchorRef} position='relative'>
      <TextField
        name='user'
        label={label}
        value={searchText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        placeholder={`Search or select ${label.toLowerCase()}`}
        icon={<SearchIcon />}
        iconAlignment='right'
        inputProps={{ maxLength: 50 }}
        error={error}
        errorText={errorText}
        required
      />
      <Popper
        open={isOpen && filteredOptions.length > 0}
        anchorEl={anchorRef.current}
        placement='bottom-start'
        style={{ width: anchorRef.current?.offsetWidth, zIndex: 1000 }}
      >
        <Paper elevation={3}>
          <MenuList>
            {filteredOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSelectOption(option)}
                selected={searchText === option.label}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  );
};

// ── Searchable Contact Field Component ──────────────────────────
interface ContactFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const ContactSearchField = ({ value, callerOptions, onChange }: ContactFieldProps) => {
  const [searchText, setSearchText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const filteredOptions = callerOptions.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    onChange(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleSelectOption = (option: { value: string; label: string }) => {
    setSearchText(option.label);
    onChange(option.label);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (callerOptions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Box ref={anchorRef} position='relative'>
      <TextField
        name='contact'
        label='Additional Contact(s)'
        value={searchText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder='Search or select contact'
        icon={<SearchIcon />}
        iconAlignment='right'
        inputProps={{ maxLength: 50 }}
      />
      <Popper
        open={isOpen && filteredOptions.length > 0}
        anchorEl={anchorRef.current}
        placement='bottom-start'
        style={{ width: anchorRef.current?.offsetWidth, zIndex: 1000 }}
      >
        <Paper elevation={3}>
          <MenuList>
            {filteredOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSelectOption(option)}
                selected={searchText === option.label}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  );
};

// ── Ticket Info Content Component ────────────────────────────
interface TicketInfoContentProps {
  ticketNumber: string;
  client: string;
  onClientChange: (value: string) => void;
  callerOptions: { value: string; label: string }[];
  classes: any;
}

const TicketInfoContent = ({
  ticketNumber,
  client,
  onClientChange,
  callerOptions,
  classes,
}: TicketInfoContentProps) => {
  return (
    <Box className={classes.formGrid}>
      <TextField
        label='Ticket Number'
        value={ticketNumber}
        disabled
        className={classes.ticketNumber}
      />
      <ClientSearchField
        value={client}
        callerOptions={callerOptions}
        onChange={onClientChange}
        classes={classes}
      />
    </Box>
  );
};

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
      <TicketInfoContent
        ticketNumber={ticketNumber}
        client={client}
        onClientChange={onClientChange}
        callerOptions={callerOptions}
        classes={classes}
      />
      <Box className={classes.formGrid}>
        <UserSearchField
          value={caller}
          callerOptions={callerOptions}
          onChange={onCallerChange}
          onBlur={onCallerBlur}
          error={!!(callerTouched && callerError)}
          errorText={reqError(callerTouched, callerError)}
          label='Affected user'
        />
        <ContactSearchField
          value={additionalContacts}
          callerOptions={callerOptions}
          onChange={onAdditionalContactsChange}
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
