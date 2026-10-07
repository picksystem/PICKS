import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  alpha,
} from '@mui/material';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AccessTimeIcon,
  PeopleIcon,
  ExpandMoreIcon,
  EditIcon,
  UserAvatar,
} from '../../../../components';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { ITicketTypeLayoutConfig } from '@serviceops/interfaces';
import { getDefaultLayoutConfig, applyFieldConfig } from '@serviceops/tickettypelayout';
import { useConfiguration } from '@serviceops/confighooks';
import { TimeSummaryData, TicketEntity, TicketUpdateInput } from '../types/ticketDetail.types';

interface SidebarProps {
  classes: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cx: (...args: any[]) => string;
  incident: TicketEntity;
  user?: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
  } | null;
  sidebarOpen: boolean;
  isEditing: boolean;
  editFormData: TicketUpdateInput;
  onEditFormChange: (data: Partial<TicketUpdateInput>) => void;
  onToggle: () => void;
  timeSummary?: TimeSummaryData;
  layoutConfig?: ITicketTypeLayoutConfig;
}

// ── Sub-component sx factories (defined outside JSX) ──────────────────────

const getFieldCardSx = (accentColor: string) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 1,
  p: '10px 14px',
  borderRadius: '12px',
  background: '#f8faff',
  border: '1px solid rgba(226, 232, 255, 0.9)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: '#eef2ff',
    border: `1px solid ${accentColor}50`,
    transform: 'translateX(3px)',
  },
});

const getFieldIconPillSx = (accentColor: string) => ({
  width: 34,
  height: 34,
  borderRadius: '10px',
  background: `${accentColor}18`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: accentColor,
});

const fieldLabelSx = (accentColor: string) => ({
  fontSize: '0.65rem',
  color: accentColor,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.7px',
  lineHeight: 1.2,
  mb: 0.25,
});

const fieldValueSx = (hasValue: boolean) => ({
  fontSize: '0.875rem',
  color: hasValue ? '#1e293b' : '#94a3b8',
  fontWeight: hasValue ? 600 : 400,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  lineHeight: 1.3,
});

const getEditDropdownCardSx = (accentColor: string) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 1,
  p: '8px 12px 8px 14px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${accentColor}0a 0%, ${accentColor}05 100%)`,
  border: `1.5px dashed ${accentColor}50`,
  transition: 'all 0.22s ease',
  cursor: 'pointer',
  '&:hover': {
    border: `1.5px dashed ${accentColor}90`,
    background: `${accentColor}0e`,
    transform: 'translateX(2px)',
  },
  '&:focus-within': {
    border: `1.5px solid ${accentColor}80`,
    background: `${accentColor}10`,
    boxShadow: `0 0 0 3px ${accentColor}18, 0 4px 16px ${accentColor}10`,
  },
});

const getEditIconPillSx = (accentColor: string) => ({
  width: 34,
  height: 34,
  borderRadius: '10px',
  background: `${accentColor}22`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: accentColor,
});

const editPencilBadgeSx = (accentColor: string) => ({
  position: 'absolute' as const,
  bottom: -3,
  right: -3,
  width: 14,
  height: 14,
  borderRadius: '50%',
  background: accentColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1.5px solid #fff',
});

const getToggleRowSx = (accentColor: string, checked: boolean, disabled?: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 0.75,
  px: 1.5,
  py: 0.75,
  borderRadius: '12px',
  background: checked ? `${accentColor}10` : '#f8faff',
  border: `1px solid ${checked ? `${accentColor}40` : 'rgba(226, 232, 255, 0.9)'}`,
  transition: 'all 0.25s ease',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.6 : 1,
});

const getDotSx = (accentColor: string, checked: boolean) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: checked ? accentColor : '#cbd5e1',
  transition: 'background 0.25s ease',
  boxShadow: checked ? `0 0 0 3px ${accentColor}25` : 'none',
  flexShrink: 0,
});

const getSwitchSx = (accentColor: string) => ({
  '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
});

const getSectionDividerLineSx = (isEditing?: boolean, direction: 'left' | 'right' = 'left') => ({
  flex: 1,
  height: '1px',
  background: isEditing
    ? direction === 'left'
      ? 'linear-gradient(90deg, rgba(245,158,11,0.5), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5))'
    : direction === 'left'
      ? 'linear-gradient(90deg, rgba(99,102,241,0.35), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35))',
});

const getSectionDividerLabelSx = (isEditing?: boolean) => ({
  fontSize: '0.65rem',
  color: isEditing ? '#b45309' : '#6366f1',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  whiteSpace: 'nowrap' as const,
});

const styledAccordionSx = {
  background: 'transparent',
  boxShadow: 'none',
  border: '1px solid rgba(226, 232, 255, 0.9)',
  borderRadius: '12px !important',
  mb: 1,
  '&::before': { display: 'none' },
  '& .MuiAccordionSummary-root': {
    minHeight: 40,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
    px: 1.5,
    '&.Mui-expanded': { borderRadius: '12px 12px 0 0', minHeight: 40 },
  },
  '& .MuiAccordionSummary-content': { margin: '8px 0' },
  '& .MuiAccordionDetails-root': { px: 1.5, py: 1 },
};

const sidebarEditingContentSx = {
  border: '1.5px solid rgba(245, 158, 11, 0.45) !important',
  boxShadow: '0 0 0 3px rgba(245,158,11,0.08), 0 4px 24px rgba(0,0,0,0.06) !important',
};

const collapsedStripSx = {
  display: { xs: 'none', md: 'flex' },
  flexDirection: 'column' as const,
  alignItems: 'center',
  pt: '52px',
  pb: 2,
  width: '100%',
  minHeight: 220,
  gap: 0,
};

const collapsedLineTopSx = {
  width: 2,
  height: 36,
  background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.45) 100%)',
  borderRadius: 1,
};

const collapsedTextSx = {
  writingMode: 'vertical-rl' as const,
  transform: 'rotate(180deg)',
  fontSize: '0.58rem',
  fontWeight: 800,
  color: '#94a3b8',
  textTransform: 'uppercase' as const,
  letterSpacing: '3px',
  userSelect: 'none' as const,
  py: 1,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': { color: '#6366f1' },
};

const collapsedLineBottomSx = {
  width: 2,
  flex: 1,
  background: 'linear-gradient(180deg, rgba(99,102,241,0.45) 0%, transparent 100%)',
  borderRadius: 1,
};

const editBannerSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  mb: 1.5,
  px: 1.5,
  py: 0.875,
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '1.5px solid #f59e0b',
  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
};

const creatorCardSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 1.5,
  p: '12px 14px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
};

const creatorAvatarSx = {
  boxShadow: '0 2px 8px rgba(67, 56, 202, 0.35)',
  background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
  fontWeight: 700,
  flexShrink: 0,
};

const creatorInitialsSx = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.95rem',
  flexShrink: 0,
  boxShadow: '0 2px 8px rgba(67, 56, 202, 0.35)',
};

const accordionTitleSx = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#4338ca',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.6px',
};

// ── Additional named constants for inline sx removal ───────────────────────

const fieldContentSx = { minWidth: 0, flex: 1 };
const toggleLabelRowSx = { display: 'flex', alignItems: 'center', gap: 1 };
const toggleLabelSx = { fontSize: '0.8rem', color: '#334155', fontWeight: 600 };
const dividerRowSx = { display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5 };
const iconSmSx = { fontSize: '1rem' };
const accordionIconSx = { fontSize: '1rem', color: '#6366f1' };

const toggleBtnOpenSx = { right: 4 };
const toggleBtnClosedSx = { left: '50%', transform: 'translateX(-50%)' };
const bannerIconSx = { fontSize: '0.875rem', color: '#b45309', flexShrink: 0 };
const bannerTitleSx = {
  fontSize: '0.68rem',
  fontWeight: 800,
  color: '#92400e',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.6px',
  flex: 1,
};
const bannerSubtitleSx = { fontSize: '0.62rem', color: '#b45309', fontWeight: 600 };
const creatorContentSx = { minWidth: 0 };
const creatorLabelSx = {
  fontSize: '0.65rem',
  color: '#6366f1',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.7px',
  mb: 0.25,
};
const creatorNameSx = {
  fontSize: '0.875rem',
  color: '#1e293b',
  fontWeight: 700,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
};
const creatorDateSx = { fontSize: '0.72rem', color: '#64748b', fontWeight: 500 };
const accordionWrapSx = { mt: 1.5 };

// ── Sub-components ─────────────────────────────────────────────────────────

const FieldCard = ({
  icon,
  label,
  value,
  accentColor = '#6366f1',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor?: string;
}) => (
  <Box sx={getFieldCardSx(accentColor)}>
    <Box sx={getFieldIconPillSx(accentColor)}>{icon}</Box>
    <Box sx={fieldContentSx}>
      <Typography sx={fieldLabelSx(accentColor)}>{label}</Typography>
      <Typography sx={fieldValueSx(!!value)}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const ToggleRow = ({
  label,
  checked,
  disabled,
  onChange,
  accentColor = '#6366f1',
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
  accentColor?: string;
}) => (
  <Box sx={getToggleRowSx(accentColor, checked, disabled)}>
    <Box sx={toggleLabelRowSx}>
      <Box sx={getDotSx(accentColor, checked)} />
      <Typography sx={toggleLabelSx}>{label}</Typography>
    </Box>
    <Switch
      size='small'
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      sx={getSwitchSx(accentColor)}
    />
  </Box>
);

const SearchableField = ({
  label,
  value,
  options,
  onChange,
  accentColor = '#6366f1',
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  accentColor?: string;
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<{ value: string; label: string }[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (optionsOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOptionsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [optionsOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = val.trim().toLowerCase();
      const next = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
      setFilteredOptions(next);
      setOptionsOpen(next.length > 0);
    }, 150);
  };

  const handleFocus = () => {
    const q = inputValue.trim().toLowerCase();
    const next = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    setFilteredOptions(next);
    if (next.length > 0) setOptionsOpen(true);
  };

  const handleSelect = (opt: { value: string; label: string }) => {
    setInputValue(opt.label);
    setOptionsOpen(false);
    onChange(opt.value);
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions([]);
    setOptionsOpen(false);
    onChange('');
  };

  return (
    <Box ref={containerRef} sx={{ mt: 1, position: 'relative' }}>
      <TextField
        label={label}
        placeholder={`Search ${label.toLowerCase()}...`}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setOptionsOpen(false), 200)}
        fullWidth
        size='small'
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {inputValue ? (
                    <ClearIcon
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleClear}
                      sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                    />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                </Box>
              </InputAdornment>
            ),
          },
        }}
      />
      {optionsOpen && filteredOptions.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <List dense disablePadding>
            {filteredOptions.map((opt) => (
              <ListItem key={opt.value} disablePadding>
                <ListItemButton
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': { bgcolor: alpha(accentColor, 0.08) },
                  }}
                >
                  <ListItemText
                    primary={opt.label}
                    primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

const SectionDivider = ({ label, isEditing }: { label: string; isEditing?: boolean }) => (
  <Box sx={dividerRowSx}>
    <Box sx={getSectionDividerLineSx(isEditing, 'left')} />
    <Typography sx={getSectionDividerLabelSx(isEditing)}>{label}</Typography>
    <Box sx={getSectionDividerLineSx(isEditing, 'right')} />
  </Box>
);

// ── Utility ────────────────────────────────────────────────────────────────

const formatMins = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0 && m === 0) return '0h';
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Inline edit text field ──────────────────────────────────────
const EditTextField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Box sx={{ mt: 1 }}>
      <TextField
        label={label}
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
        fullWidth
        size='small'
        InputProps={{
          sx: {
            fontSize: '0.875rem',
            color: '#1e293b',
            fontWeight: 600,
            fontFamily: 'inherit',
          },
        }}
      />
    </Box>
  );
};

const getNameInitials = (nameOrEmail: string): string => {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.trim().split(/[\s@]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
};

// ── Main Component ─────────────────────────────────────────────────────────

const Sidebar = ({
  classes,
  cx,
  incident,
  user,
  sidebarOpen,
  isEditing,
  editFormData,
  onEditFormChange,
  onToggle,
  timeSummary,
  layoutConfig = getDefaultLayoutConfig(),
}: SidebarProps) => {
  const isSectionVisible = (key: string) => layoutConfig.sideBar.selectedFields.includes(key);

  const { categorization } = useConfiguration();
  const applicationOptions = useMemo(() => {
    return (categorization?.applications ?? []).map((app) => ({
      value: app.name,
      label: app.name,
    }));
  }, [categorization]);

  const billingCodeOptions = useMemo(() => {
    const codeMap = new Map<string, { code: string; description: string }>();
    (categorization?.applications ?? []).forEach((app) => {
      (app.billingCodes ?? []).forEach((bc) => {
        if (bc.isActive !== false) {
          codeMap.set(bc.code, { code: bc.code, description: bc.description });
        }
      });
    });
    return Array.from(codeMap.values()).map((bc) => ({
      value: bc.code,
      label: `${bc.code} — ${bc.description}`,
    }));
  }, [categorization]);

  const applicationCategoryOptions = useMemo(() => {
    return (categorization?.applicationCategories ?? []).map((cat) => ({
      value: cat.categoryName,
      label: cat.categoryName,
    }));
  }, [categorization]);

  const applicationSubCategoryOptions = useMemo(() => {
    return (categorization?.applicationSubCategories ?? []).map((sub) => ({
      value: sub.subCategoryName,
      label: sub.subCategoryName,
    }));
  }, [categorization]);

  const createdByMatchesUser =
    user?.email && incident.createdBy
      ? incident.createdBy.toLowerCase() === user.email.toLowerCase() ||
        incident.createdBy.toLowerCase().includes((user.firstName ?? '').toLowerCase())
      : false;

  const avatarUser =
    createdByMatchesUser && user
      ? { profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName }
      : null;

  return (
    <Box
      className={cx(
        classes.sidebar,
        sidebarOpen ? classes.sidebarExpanded : classes.sidebarCollapsed,
      )}
    >
      <IconButton
        className={classes.sidebarToggleButton}
        onClick={onToggle}
        sx={sidebarOpen ? toggleBtnOpenSx : toggleBtnClosedSx}
      >
        {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {/* ── Collapsed desktop strip ── */}
      {!sidebarOpen && (
        <Box sx={collapsedStripSx}>
          <Box sx={collapsedLineTopSx} />
          <Box sx={collapsedTextSx} onClick={onToggle}>
            Details
          </Box>
          <Box sx={collapsedLineBottomSx} />
        </Box>
      )}

      {sidebarOpen && (
        <Box
          className={classes.sidebarContent}
          sx={isEditing ? sidebarEditingContentSx : undefined}
        >
          {/* ── Edit mode banner ── */}
          {isEditing && (
            <Box sx={editBannerSx}>
              <EditIcon sx={bannerIconSx} />
              <Typography sx={bannerTitleSx}>Editing</Typography>
              <Typography sx={bannerSubtitleSx}>Tap fields to change</Typography>
            </Box>
          )}

          {/* ── Creator mini-card ── */}
          {isSectionVisible('created') && (
            <Box sx={creatorCardSx}>
              {avatarUser ? (
                <UserAvatar user={avatarUser} size={38} sx={creatorAvatarSx} />
              ) : (
                <Box sx={creatorInitialsSx}>{getNameInitials(incident.createdBy || '?')}</Box>
              )}
              <Box sx={creatorContentSx}>
                <Typography sx={creatorLabelSx}>Created</Typography>
                <Typography sx={creatorNameSx}>{incident.createdBy || '—'}</Typography>
                <Typography sx={creatorDateSx}>
                  {new Date(incident.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>
          )}

          {isSectionVisible('ticketOptions') && (
            <>
              <SectionDivider label='Ticket Options' isEditing={isEditing} />

              {/* ── Toggle options ── */}
              {applyFieldConfig(
                [
                  // isMajor only exists on Incident — Service/Advisory Requests don't have it
                  ...('isMajor' in incident
                    ? [
                        {
                          key: 'isMajor',
                          node: (
                            <ToggleRow
                              label='Major Ticket'
                              checked={
                                isEditing
                                  ? (editFormData.isMajor ?? incident.isMajor)
                                  : incident.isMajor
                              }
                              disabled={!isEditing}
                              onChange={
                                isEditing
                                  ? () =>
                                      onEditFormChange({
                                        isMajor: !(editFormData.isMajor ?? incident.isMajor),
                                      })
                                  : undefined
                              }
                              accentColor='#dc2626'
                            />
                          ),
                        },
                      ]
                    : []),
                  {
                    key: 'isRecurring',
                    node: (
                      <ToggleRow
                        label='Recurring Ticket'
                        checked={
                          isEditing
                            ? (editFormData.isRecurring ?? incident.isRecurring)
                            : incident.isRecurring
                        }
                        disabled={!isEditing}
                        onChange={
                          isEditing
                            ? () =>
                                onEditFormChange({
                                  isRecurring: !(editFormData.isRecurring ?? incident.isRecurring),
                                })
                            : undefined
                        }
                        accentColor='#d97706'
                      />
                    ),
                  },
                  {
                    key: 'isReleaseManagement',
                    node: (
                      <ToggleRow
                        label='Release Management'
                        checked={
                          isEditing
                            ? (editFormData.isReleaseManagement ?? incident.isReleaseManagement)
                            : incident.isReleaseManagement
                        }
                        disabled={!isEditing}
                        onChange={
                          isEditing
                            ? () =>
                                onEditFormChange({
                                  isReleaseManagement: !(
                                    editFormData.isReleaseManagement ?? incident.isReleaseManagement
                                  ),
                                })
                            : undefined
                        }
                        accentColor='#6366f1'
                      />
                    ),
                  },
                ],
                layoutConfig.ticketOptions.selectedFields,
              ).map(({ key, node }) => (
                <Box key={key}>{node}</Box>
              ))}
            </>
          )}

          {/* ── Collapsible sections ── */}
          <Box sx={accordionWrapSx}>
            {/* Contact & Billing */}
            {isSectionVisible('contactAndBilling') && (
              <Accordion sx={styledAccordionSx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={accordionIconSx} />}>
                  <Typography sx={accordionTitleSx}>Contact &amp; Billing</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {isEditing ? (
                    <>
                      <SearchableField
                        label='Billing Code'
                        value={editFormData.billingCode || ''}
                        options={billingCodeOptions}
                        onChange={(val) => onEditFormChange({ billingCode: val })}
                      />
                      <Box sx={{ pt: 1 }}>
                        <EditTextField
                          label='Estimate Details'
                          value={editFormData.estimatesDetails || ''}
                          onChange={(val) => onEditFormChange({ estimatesDetails: val })}
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <FieldCard
                        icon={<AccessTimeIcon sx={iconSmSx} />}
                        label='Billing Code'
                        value={incident.billingCode || ''}
                        accentColor='#1422e4'
                      />
                      <Box sx={{ pt: 1 }}>
                        <FieldCard
                          icon={<AccessTimeIcon sx={iconSmSx} />}
                          label='Estimate Details'
                          value={incident.estimatesDetails || ''}
                          accentColor='#1422e4'
                        />
                      </Box>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Estimate Details */}
            {isSectionVisible('estimateDetails') && (
              <Accordion sx={styledAccordionSx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={accordionIconSx} />}>
                  <Typography sx={accordionTitleSx}>Estimate Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {isEditing ? (
                    <EditTextField
                      label='Estimate Details'
                      value={editFormData.estimatesDetails || ''}
                      onChange={(val) => onEditFormChange({ estimatesDetails: val })}
                    />
                  ) : (
                    <FieldCard
                      icon={<AccessTimeIcon sx={iconSmSx} />}
                      label='Estimate Details'
                      value={incident.estimatesDetails || ''}
                      accentColor='#1422e4'
                    />
                  )}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Reporting */}
            {isSectionVisible('reporting') && (
              <Accordion sx={styledAccordionSx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={accordionIconSx} />}>
                  <Typography sx={accordionTitleSx}>Reporting</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {isEditing ? (
                    <EditTextField
                      label='Analysis Summary'
                      value={editFormData.analysisSummary || ''}
                      onChange={(val) => onEditFormChange({ analysisSummary: val })}
                    />
                  ) : (
                    <FieldCard
                      icon={<AccessTimeIcon sx={iconSmSx} />}
                      label='Analysis Summary'
                      value={incident.analysisSummary || ''}
                      accentColor='#1422e4'
                    />
                  )}
                  <Box sx={{ pt: 1 }}>
                    {isEditing ? (
                      <SearchableField
                        label='Application'
                        value={editFormData.application || ''}
                        options={applicationOptions}
                        onChange={(val) => onEditFormChange({ application: val })}
                      />
                    ) : (
                      <FieldCard
                        icon={<AccessTimeIcon sx={iconSmSx} />}
                        label='Application'
                        value={incident.application || ''}
                        accentColor='#1422e4'
                      />
                    )}
                  </Box>
                  <Box sx={{ pt: 1 }}>
                    {isEditing ? (
                      <SearchableField
                        label='Application Category'
                        value={editFormData.applicationCategory || ''}
                        options={applicationCategoryOptions}
                        onChange={(val) => onEditFormChange({ applicationCategory: val })}
                      />
                    ) : (
                      <FieldCard
                        icon={<AccessTimeIcon sx={iconSmSx} />}
                        label='Application Category'
                        value={incident.applicationCategory || ''}
                        accentColor='#1422e4'
                      />
                    )}
                  </Box>
                  <Box sx={{ pt: 1 }}>
                    {isEditing ? (
                      <SearchableField
                        label='Application Sub Category'
                        value={editFormData.applicationSubCategory || ''}
                        options={applicationSubCategoryOptions}
                        onChange={(val) => onEditFormChange({ applicationSubCategory: val })}
                      />
                    ) : (
                      <FieldCard
                        icon={<AccessTimeIcon sx={iconSmSx} />}
                        label='Application Sub Category'
                        value={incident.applicationSubCategory || ''}
                        accentColor='#1422e4'
                      />
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Dates and Users */}
            {isSectionVisible('datesAndUsers') && (
              <Accordion sx={styledAccordionSx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={accordionIconSx} />}>
                  <Typography sx={accordionTitleSx}>Dates and Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {applyFieldConfig(
                    [
                      {
                        key: 'resolvedAt',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Resolved Date and Time'
                            value={formatDateTime(incident.resolvedAt)}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'resolvedBy',
                        node: (
                          <FieldCard
                            icon={<PeopleIcon sx={iconSmSx} />}
                            label='Resolved By'
                            value={incident.resolvedBy || ''}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'closedAt',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Closed Date and Time'
                            value={formatDateTime(incident.closedAt)}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'closedBy',
                        node: (
                          <FieldCard
                            icon={<PeopleIcon sx={iconSmSx} />}
                            label='Closed By'
                            value={incident.closedBy || ''}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'reopenedAt',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Reopened Date and Time'
                            value={formatDateTime(incident.reopenedAt)}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'reopenedBy',
                        node: (
                          <FieldCard
                            icon={<PeopleIcon sx={iconSmSx} />}
                            label='Reopened By'
                            value={incident.reopenedBy || ''}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'approvedAt',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Approved Date and Time'
                            value={formatDateTime(incident.approvedAt)}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'approvedBy',
                        node: (
                          <FieldCard
                            icon={<PeopleIcon sx={iconSmSx} />}
                            label='Approved By'
                            value={incident.approvedBy || ''}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                    ],
                    layoutConfig.datesAndUsers.selectedFields,
                  ).map(({ key, node }) => (
                    <Box key={key}>{node}</Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Additional Fields */}
            {isSectionVisible('additionalFields') && (
              <Accordion sx={styledAccordionSx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={accordionIconSx} />}>
                  <Typography sx={accordionTitleSx}>Additional Fields</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {applyFieldConfig(
                    [
                      {
                        key: 'timeSpentBillable',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Time Spent (Billable hrs)'
                            value={timeSummary ? formatMins(timeSummary.billableMinutes) : '—'}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'timeSpentNonBillable',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Time Spent (Non-Billable hrs)'
                            value={timeSummary ? formatMins(timeSummary.nonBillableMinutes) : '—'}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                      {
                        key: 'variance',
                        node: (
                          <FieldCard
                            icon={<AccessTimeIcon sx={iconSmSx} />}
                            label='Variance'
                            value={(() => {
                              const approved = incident.approvedEstimatesHours;
                              if (!approved || !timeSummary) return '—';
                              const billableHrs = timeSummary.billableMinutes / 60;
                              const variance = approved - billableHrs;
                              return `${variance.toFixed(1)}h`;
                            })()}
                            accentColor='#1422e4'
                          />
                        ),
                      },
                    ],
                    layoutConfig.additionalFields.selectedFields,
                  ).map(({ key, node }) => (
                    <Box key={key}>{node}</Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
