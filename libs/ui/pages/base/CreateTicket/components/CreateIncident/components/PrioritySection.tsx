import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, TextField, Select } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from '../styles';
import { useState, useRef } from 'react';
import { Paper, Popper, MenuItem, MenuList } from '@mui/material';

interface PrioritySectionProps {
  values: {
    impact: string;
    urgency: string;
    priority: string;
    status: string;
    assignmentGroup: string;
    primaryResource: string;
    secondaryResources: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  impactOptions: { value: string; label: string }[];
  urgencyOptions: { value: string; label: string }[];
  priorityOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
  onSelectChange: (field: string, value: string) => void;
}

// ── Searchable Resource Field Component ─────────────────────────
interface ResourceFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur: React.FocusEventHandler;
  error: boolean;
  errorText?: string | React.ReactNode;
  label: string;
  required?: boolean;
}

const ResourceSearchField = ({
  value,
  options,
  onChange,
  onBlur,
  error,
  errorText,
  label,
  required,
}: ResourceFieldProps) => {
  const [searchText, setSearchText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
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
    if (options.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Box ref={anchorRef} position='relative'>
      <TextField
        name={label.toLowerCase().replace(/\s+/g, '')}
        label={label}
        value={searchText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        placeholder={`Search or enter ${label.toLowerCase()}`}
        icon={<SearchIcon />}
        iconAlignment='right'
        inputProps={{ maxLength: 80 }}
        error={error}
        errorText={errorText}
        required={required}
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

const PrioritySection = ({
  values,
  touched,
  errors,
  impactOptions,
  urgencyOptions,
  priorityOptions,
  statusOptions,
  onChange,
  onBlur,
  onSelectChange,
}: PrioritySectionProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  return (
    <>
      <Typography className={classes.sectionTitle}>Priority, Status and Assignment</Typography>
      <Box className={classes.formGrid}>
        <Select
          label='Impact'
          options={impactOptions}
          value={values.impact}
          onChange={(e) => onSelectChange('impact', e.target.value as string)}
          onBlur={onBlur}
          error={!!(touched.impact && errors.impact)}
          errorText={reqError(touched.impact, errors.impact)}
          required
        />
        <Select
          label='Urgency'
          options={urgencyOptions}
          value={values.urgency}
          onChange={(e) => onSelectChange('urgency', e.target.value as string)}
          onBlur={onBlur}
          error={!!(touched.urgency && errors.urgency)}
          errorText={reqError(touched.urgency, errors.urgency)}
          required
        />
        <TextField label='Calculated Priority' value={values.priority} disabled />
        <Select
          label='Status'
          options={statusOptions}
          value={values.status}
          onChange={(e) => onSelectChange('status', e.target.value as string)}
        />
        <ResourceSearchField
          value={values.assignmentGroup}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'assignmentGroup', value },
            } as any;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.assignmentGroup && errors.assignmentGroup)}
          errorText={reqError(touched.assignmentGroup, errors.assignmentGroup)}
          label='Assignment Group'
          required
        />
        <ResourceSearchField
          value={values.primaryResource}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'primaryResource', value },
            } as any;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.primaryResource && errors.primaryResource)}
          errorText={reqError(touched.primaryResource, errors.primaryResource)}
          label='Primary Resource'
        />
        <ResourceSearchField
          value={values.secondaryResources}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'secondaryResources', value },
            } as any;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.secondaryResources && errors.secondaryResources)}
          errorText={reqError(touched.secondaryResources, errors.secondaryResources)}
          label='Secondary Resource(s)'
        />
      </Box>
    </>
  );
};

export default PrioritySection;
