import { Box, Typography, Grid, Select, MenuItem, TextField } from '@serviceops/component';
import {
  FormControl,
  FormHelperText,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import { useFieldError } from '@serviceops/hooks';
import { type WorkDetailsStepProps, type NominatimResult, searchLocations } from './util';
import React, { useState, useRef, useEffect } from 'react';

const ACCENT_WL = '#be185d';

const WorkDetailsStep = ({
  values,
  touched,
  errors,
  onChange,
  onRoleChange,
  onBlur,
  classes,
}: WorkDetailsStepProps) => {
  const reqError = useFieldError();
  const [inputValue, setInputValue] = useState(values.workLocation || '');
  const [options, setOptions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(values.workLocation || '');
  }, [values.workLocation]);

  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (newInputValue.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      searchLocations(newInputValue, abortControllerRef.current.signal)
        .then((results) => {
          setOptions(results);
          setOpen(results.length > 0);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Location search error:', error);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  };

  const handleSelect = (location: NominatimResult) => {
    setInputValue(location.display_name);
    setOpen(false);
    setOptions([]);

    const syntheticEvent = {
      target: {
        name: 'workLocation',
        value: location.display_name,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    setOpen(false);

    const syntheticEvent = {
      target: {
        name: 'workLocation',
        value: '',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <Box className={classes.sectionCard}>
      <Box className={classes.sectionHeader}>
        <Box className={classes.sectionIcon}>
          <WorkIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography fontWeight={600} fontSize='0.95rem'>
          Work Details
        </Typography>
      </Box>
      <Box className={classes.stepContent}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                id='workLocation'
                name='workLocation'
                label='Work Location'
                placeholder='Search for a city...'
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  const syntheticEvent = {
                    target: {
                      name: 'workLocation',
                      value: e.target.value,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(syntheticEvent);
                  handleInputChange(e.target.value);
                }}
                onBlur={() => {
                  onBlur({
                    target: { name: 'workLocation' },
                  } as React.FocusEvent<HTMLInputElement>);
                  setTimeout(() => setOpen(false), 200);
                }}
                onFocus={() => {
                  if (inputValue.length >= 2 && options.length > 0) {
                    setOpen(true);
                  }
                }}
                error={touched.workLocation && Boolean(errors.workLocation)}
                helperText={
                  touched.workLocation && errors.workLocation ? errors.workLocation : undefined
                }
                required
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {loading ? (
                            <CircularProgress size={16} />
                          ) : inputValue ? (
                            <ClearIcon
                              onClick={handleClear}
                              sx={{
                                fontSize: 18,
                                color: 'text.secondary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          ) : (
                            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          )}
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
                errorText={reqError(touched.workLocation, errors.workLocation)}
              />

              {open && options.length > 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 0.5,
                    maxHeight: 280,
                    overflow: 'auto',
                  }}
                >
                  <List dense disablePadding>
                    {options.map((option) => (
                      <ListItem key={option.place_id} disablePadding>
                        <ListItemButton
                          onClick={() => handleSelect(option)}
                          sx={{
                            py: 1,
                            px: 1.5,
                            '&:hover': {
                              bgcolor: alpha(ACCENT_WL || '#1976d2', 0.08),
                            },
                          }}
                        >
                          <LocationOnIcon
                            sx={{ fontSize: 18, mr: 1, color: 'text.secondary', flexShrink: 0 }}
                          />
                          <ListItemText
                            primary={option.display_name}
                            primaryTypographyProps={{
                              fontSize: '0.84rem',
                              noWrap: true,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='department'
              name='department'
              label='Department'
              type='text'
              placeholder='e.g. IT Support'
              value={values.department ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.department && Boolean(errors.department)}
              errorText={touched.department ? errors.department : undefined}
              fullWidth
              icon={<SearchIcon sx={{ fontSize: 22 }} />}
              iconAlignment='right'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='employeeId'
              name='employeeId'
              label='Employee ID (Optional)'
              type='text'
              placeholder='e.g. 12345'
              value={values.employeeId}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.employeeId && Boolean(errors.employeeId)}
              errorText={touched.employeeId ? errors.employeeId : undefined}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='businessUnit'
              name='businessUnit'
              label='Business Unit (Optional)'
              type='text'
              placeholder='e.g. Operations'
              value={values.businessUnit}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.businessUnit && Boolean(errors.businessUnit)}
              errorText={touched.businessUnit ? errors.businessUnit : undefined}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              id='managerName'
              name='managerName'
              label='Reporting Manager'
              type='text'
              placeholder="Your manager's full name"
              value={values.managerName}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.managerName && Boolean(errors.managerName)}
              errorText={reqError(touched.managerName, errors.managerName)}
              fullWidth
              required
              icon={<SearchIcon sx={{ fontSize: 22 }} />}
              iconAlignment='right'
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              id='reasonForAccess'
              name='reasonForAccess'
              label='Reason for Access'
              type='text'
              placeholder='Briefly describe why you need access to ServiceOps...'
              value={values.reasonForAccess}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.reasonForAccess && Boolean(errors.reasonForAccess)}
              errorText={reqError(touched.reasonForAccess, errors.reasonForAccess)}
              fullWidth
              required
              multiline
              minRows={3}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required error={touched.role && Boolean(errors.role)}>
              <Select
                labelId='role-label'
                id='role'
                name='role'
                value={values.role}
                label='Requested Role'
                onChange={onRoleChange}
                onBlur={onBlur}
                required
              >
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='consultant'>Consultant</MenuItem>
              </Select>
              <FormHelperText>
                All sign-ups require admin approval before you can access the system.
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default WorkDetailsStep;
