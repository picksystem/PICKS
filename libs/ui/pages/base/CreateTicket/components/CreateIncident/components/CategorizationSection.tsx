import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, TextField } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from '../styles';
import { useState, useRef } from 'react';
import { Paper, Popper, MenuItem, MenuList } from '@mui/material';

interface CategorizationSectionProps {
  values: {
    businessCategory: string;
    serviceLine: string;
    application: string;
    applicationCategory: string;
    applicationSubCategory: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
}

// ── Searchable Category Field Component ─────────────────────────
interface CategoryFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur: React.FocusEventHandler;
  error: boolean;
  errorText?: string | React.ReactNode;
  label: string;
  required?: boolean;
}

const CategorySearchField = ({
  value,
  options,
  onChange,
  onBlur,
  error,
  errorText,
  label,
  required,
}: CategoryFieldProps) => {
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

  return (
    <Box ref={anchorRef} position='relative'>
      <TextField
        name={label.toLowerCase().replace(/\s+/g, '')}
        label={required ? `${label} *` : label}
        value={searchText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        placeholder={`Search or select ${label.toLowerCase()}`}
        icon={<SearchIcon />}
        iconAlignment='right'
        inputProps={{ maxLength: 80 }}
        error={error}
        errorText={errorText}
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

const CategorizationSection = ({
  values,
  touched,
  errors,
  onChange,
  onBlur,
}: CategorizationSectionProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  return (
    <>
      <Typography className={classes.sectionTitle}>Categorization</Typography>
      <Box className={classes.formGrid}>
        <CategorySearchField
          value={values.businessCategory}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'businessCategory', value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.businessCategory && errors.businessCategory)}
          errorText={reqError(touched.businessCategory, errors.businessCategory)}
          label='Business Category'
          required
        />
        <CategorySearchField
          value={values.serviceLine}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'serviceLine', value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.serviceLine && errors.serviceLine)}
          errorText={reqError(touched.serviceLine, errors.serviceLine)}
          label='Service Line'
          required
        />
        <CategorySearchField
          value={values.application}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'application', value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.application && errors.application)}
          errorText={reqError(touched.application, errors.application)}
          label='Application / Product'
          required
        />
        <CategorySearchField
          value={values.applicationCategory}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'applicationCategory', value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.applicationCategory && errors.applicationCategory)}
          errorText={reqError(touched.applicationCategory, errors.applicationCategory)}
          label='Application / Product Category'
        />
        <CategorySearchField
          value={values.applicationSubCategory}
          options={[]}
          onChange={(value) => {
            const event = {
              target: { name: 'applicationSubCategory', value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          onBlur={onBlur}
          error={!!(touched.applicationSubCategory && errors.applicationSubCategory)}
          errorText={reqError(touched.applicationSubCategory, errors.applicationSubCategory)}
          label='Application / Product Sub-category'
        />
      </Box>
    </>
  );
};

export default CategorizationSection;
