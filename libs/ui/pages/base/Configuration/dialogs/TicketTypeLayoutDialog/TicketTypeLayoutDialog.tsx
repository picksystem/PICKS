import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@serviceops/component';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CreateIcon from '@mui/icons-material/NoteAdd';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { alpha, Dialog, DialogActions } from '@mui/material';
import { ITicketType, ICustomField } from '@serviceops/interfaces';
import { useNotification } from '@serviceops/hooks';
import { CustomFieldFormDialog } from '../CustomFieldFormDialog';

// ── Types ──────────────────────────────────────────────────────────

type Section = {
  id: string;
  title: string;
  fields: string[];
};

type TabId = 'createTicket' | 'ticketDetails';

// ── Constants ──────────────────────────────────────────────────────

const POOL_PANEL_WIDTH = 320;

const columnLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  mb: 1,
};

// ── Props ──────────────────────────────────────────────────────────

export interface TicketTypeLayoutDialogProps {
  open: boolean;
  ticketType: ITicketType | null;
  /** All ticket types so the Add Custom Field dialog can show per-type checkboxes. */
  ticketTypes?: ITicketType[];
  onClose: () => void;
  onSave?: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export const TicketTypeLayoutDialog = ({
  open,
  ticketType,
  ticketTypes = [],
  onClose,
  onSave,
}: TicketTypeLayoutDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('createTicket');
  const { error: notifyError } = useNotification();

  // New field dialog
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);

  // Section title input
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSectionInput, setShowSectionInput] = useState(false);

  // Field type dropdown anchor
  const [fieldTypeAnchor, setFieldTypeAnchor] = useState<null | HTMLElement>(null);
  const [showFieldTypeDropdown, setShowFieldTypeDropdown] = useState(false);

  // Sections per tab - start empty, user builds from scratch
  const [sections, setSections] = useState<Record<TabId, Section[]>>({
    createTicket: [],
    ticketDetails: [],
  });

  // Available fields per tab
  const [availableFields, setAvailableFields] = useState<Record<TabId, string[]>>({
    createTicket: [],
    ticketDetails: [],
  });

  // Edit mode for field names
  const [editingField, setEditingField] = useState<{ name: string; temp: string } | null>(null);
  const fieldInputRef = useRef<HTMLInputElement>(null);

  // Edit mode for section titles
  const [editingSection, setEditingSection] = useState<{ id: string; temp: string } | null>(null);
  const sectionTitleInputRef = useRef<HTMLInputElement>(null);

  const currentSections = sections[activeTab] ?? [];
  const currentAvailable = availableFields[activeTab] ?? [];

  // All fields currently assigned across all sections
  const assignedFields = useMemo(() => currentSections.flatMap((s) => s.fields), [currentSections]);

  // Auto-focus inline edit inputs
  useEffect(() => {
    if (editingField && fieldInputRef.current) {
      fieldInputRef.current.focus();
      fieldInputRef.current.select();
    }
  }, [editingField]);

  useEffect(() => {
    if (showSectionInput && sectionTitleInputRef.current) {
      sectionTitleInputRef.current.focus();
      sectionTitleInputRef.current.select();
    }
  }, [showSectionInput]);

  // ── Field Handlers ───────────────────────────────────────────────

  const handleSaveCustomField = useCallback(
    (field: ICustomField) => {
      // Determine which tabs this field applies to based on the Field Use flags.
      // The `__createTicket__` and `__ticketDetails__` keys in field.fieldUse drive visibility.
      const tabsToUpdate: TabId[] = [];
      if (field.fieldUse?.__createTicket__) tabsToUpdate.push('createTicket');
      if (field.fieldUse?.__ticketDetails__) tabsToUpdate.push('ticketDetails');
      // If neither flag is set (shouldn't happen — the dialog requires at least one),
      // fall back to the currently active tab so the field doesn't disappear silently.
      if (tabsToUpdate.length === 0) tabsToUpdate.push(activeTab);

      // Add field name to the available pool for each applicable tab
      setAvailableFields((prev) => {
        const next = { ...prev };
        for (const tab of tabsToUpdate) {
          if (!next[tab].includes(field.fieldName)) {
            next[tab] = [...next[tab], field.fieldName];
          }
        }
        return next;
      });

      // Create a default section for the new field in each applicable tab
      const sectionId = `section_${Date.now()}`;
      setSections((prev) => {
        const next = { ...prev };
        for (const tab of tabsToUpdate) {
          next[tab] = [
            ...next[tab],
            { id: `${sectionId}_${tab}`, title: field.fieldName, fields: [] },
          ];
        }
        return next;
      });

      setAddFieldDialogOpen(false);
    },
    [activeTab],
  );

  const handleRemoveField = useCallback(
    (fieldName: string) => {
      setAvailableFields((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((f) => f !== fieldName),
      }));
      setSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) => ({
          ...s,
          fields: s.fields.filter((f) => f !== fieldName),
        })),
      }));
    },
    [activeTab],
  );

  const handleEditFieldStart = useCallback((fieldName: string) => {
    setEditingField({ name: fieldName, temp: fieldName });
  }, []);

  const handleEditFieldSave = useCallback(() => {
    if (!editingField) return;

    const newName = editingField.temp.trim();
    if (!newName) {
      setEditingField(null);
      return;
    }

    // Check duplicate (exclude the current field being edited)
    const allExisting = [
      ...assignedFields.filter((f) => f !== editingField.name),
      ...currentAvailable.filter((f) => f !== editingField.name),
    ];
    if (allExisting.includes(newName)) {
      notifyError('This field name already exists');
      return;
    }

    // Update field name in available fields
    setAvailableFields((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((f) => (f === editingField.name ? newName : f)),
    }));

    // Update field name in all sections
    setSections((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((s) => ({
        ...s,
        fields: s.fields.map((f) => (f === editingField.name ? newName : f)),
      })),
    }));

    setEditingField(null);
  }, [editingField, activeTab, assignedFields, currentAvailable, notifyError]);

  const handleEditFieldCancel = useCallback(() => {
    setEditingField(null);
  }, []);

  // ── Section Handlers ─────────────────────────────────────────────

  const handleAddSectionWithTitle = useCallback(
    (title: string) => {
      const id = `section_${Date.now()}`;
      setSections((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], { id, title, fields: [] }],
      }));
    },
    [activeTab],
  );

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      setSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((s) => s.id !== sectionId),
      }));
    },
    [activeTab],
  );

  const handleEditSectionTitleStart = useCallback((sectionId: string, title: string) => {
    setEditingSection({ id: sectionId, temp: title });
  }, []);

  const handleUpdateSectionTitle = useCallback(
    (sectionId: string, title: string) => {
      setSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) => (s.id === sectionId ? { ...s, title } : s)),
      }));
    },
    [activeTab],
  );

  const handleEditSectionTitleSave = useCallback(() => {
    if (!editingSection) return;

    const newTitle = editingSection.temp.trim();
    if (newTitle) {
      handleUpdateSectionTitle(editingSection.id, newTitle);
    }
    setEditingSection(null);
  }, [editingSection, handleUpdateSectionTitle]);

  const handleEditSectionTitleCancel = useCallback(() => {
    setEditingSection(null);
  }, []);

  // ── Section Field Handlers ───────────────────────────────────────

  const handleAddFieldToSection = useCallback(
    (sectionId: string, fieldName: string) => {
      if (!fieldName) return;
      setAvailableFields((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((f) => f !== fieldName),
      }));
      setSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) =>
          s.id === sectionId ? { ...s, fields: [...s.fields, fieldName] } : s,
        ),
      }));
    },
    [activeTab],
  );

  const handleRemoveFieldFromSection = useCallback(
    (sectionId: string, fieldName: string) => {
      setSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) =>
          s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f !== fieldName) } : s,
        ),
      }));
    },
    [activeTab],
  );

  // ── Save ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    const payload = {
      createTicket: activeTab === 'createTicket' ? sections.createTicket : undefined,
      ticketDetails: activeTab === 'ticketDetails' ? sections.ticketDetails : undefined,
    };
    console.warn('Saving layout:', payload);
    onSave?.();
    onClose();
  };

  // ── JSX ───────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      slotProps={{
        transition: { unmountOnExit: true },
        paper: { sx: { borderRadius: 3, overflow: 'hidden' } },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: '#0369a1',
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
            Ticket Screen Layout
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
            {ticketType ? `Configure fields for ${ticketType.displayName || ticketType.name}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant='fullWidth'
          sx={{ px: 2 }}
        >
          <Tab
            icon={<CreateIcon />}
            iconPosition='start'
            label='Create Ticket'
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab
            icon={<ViewQuiltIcon />}
            iconPosition='start'
            label='Ticket Details'
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
        </Tabs>
      </Box>

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          maxHeight: 520,
          overflow: 'hidden',
        }}
      >
        {/* Left Panel: New Fields */}
        <Box
          sx={{
            width: { xs: '100%', md: `${POOL_PANEL_WIDTH}px` },
            minWidth: { xs: 0, md: `${POOL_PANEL_WIDTH}px` },
            borderRight: { md: '1px solid rgba(226, 232, 255, 0.9)' },
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: 280, md: 520 },
            bgcolor: 'background.paper',
          }}
        >
          {/* New Fields header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={columnLabelSx}>Ticket Fields</Typography>
            <Tooltip title='Add New Field'>
              <IconButton
                size='small'
                onClick={() => setAddFieldDialogOpen(true)}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Available fields list */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {currentAvailable.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  color: 'text.disabled',
                  fontSize: '0.8rem',
                }}
              >
                No fields added yet
              </Box>
            ) : (
              currentAvailable.map((field) => {
                const isEditing = editingField?.name === field;

                return (
                  <Box
                    key={field}
                    sx={{
                      px: 2.5,
                      py: 1.2,
                      borderBottom: '1px solid rgba(226, 232, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {isEditing ? (
                      <>
                        <TextField
                          inputRef={fieldInputRef}
                          value={editingField.temp}
                          onChange={(e) =>
                            setEditingField((prev) =>
                              prev ? { ...prev, temp: e.target.value } : null,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleEditFieldSave();
                            } else if (e.key === 'Escape') {
                              handleEditFieldCancel();
                            }
                          }}
                          onBlur={handleEditFieldSave}
                          size='small'
                          sx={{
                            flex: 1,
                            '& .MuiInput-input': {
                              fontSize: '0.85rem',
                              padding: '4px 8px',
                            },
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>{field}</Typography>
                        <IconButton
                          size='small'
                          onClick={() => handleEditFieldStart(field)}
                          sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#1976d2' } }}
                        >
                          <EditIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleRemoveField(field)}
                          sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#d32f2f' } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {/* Right Panel: Sections */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: { xs: 380, md: 520 },
            p: 2,
            bgcolor: alpha('#f8faff', 1),
          }}
        >
          {/* Sections header with add button */}
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ ...columnLabelSx, mb: 0 }}>
              {activeTab === 'createTicket' ? 'Ticket Sections' : 'Ticket Detail Sections'}
            </Typography>
            <Tooltip title='Add New Section'>
              <IconButton
                size='small'
                onClick={() => setShowSectionInput(true)}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Inline section title input (shown when + button clicked) */}
          {showSectionInput && (
            <Box sx={{ mb: 2 }}>
              <TextField
                inputRef={sectionTitleInputRef}
                size='small'
                placeholder='Section title...'
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const title = newSectionTitle.trim();
                    if (title) {
                      handleAddSectionWithTitle(title);
                    }
                    setShowSectionInput(false);
                    setNewSectionTitle('');
                  } else if (e.key === 'Escape') {
                    setShowSectionInput(false);
                    setNewSectionTitle('');
                  }
                }}
                onBlur={() => {
                  if (newSectionTitle.trim()) {
                    handleAddSectionWithTitle(newSectionTitle.trim());
                  }
                  setShowSectionInput(false);
                  setNewSectionTitle('');
                }}
                fullWidth
              />
            </Box>
          )}

          {/* Section cards */}
          {currentSections.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                color: 'text.disabled',
                fontSize: '0.85rem',
              }}
            >
              <Typography>No sections yet. Click "+ Add New Section" to create one.</Typography>
            </Box>
          ) : (
            currentSections.map((section) => {
              const isEditing = editingSection?.id === section.id;

              return (
                <Box
                  key={section.id}
                  sx={{
                    border: '1.5px solid rgba(226, 232, 255, 0.9)',
                    borderRadius: '10px',
                    mb: 1.5,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                  }}
                >
                  {/* Section header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: alpha('#0369a1', 0.06),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      borderBottom:
                        section.fields.length > 0 ? '1px solid rgba(226, 232, 255, 0.6)' : 'none',
                    }}
                  >
                    {isEditing ? (
                      <TextField
                        inputRef={sectionTitleInputRef}
                        value={editingSection.temp}
                        onChange={(e) =>
                          setEditingSection((prev) =>
                            prev ? { ...prev, temp: e.target.value } : null,
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditSectionTitleSave();
                          } else if (e.key === 'Escape') {
                            handleEditSectionTitleCancel();
                          }
                        }}
                        onBlur={handleEditSectionTitleSave}
                        size='small'
                        sx={{
                          flex: 1,
                          '& .MuiInput-input': {
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            padding: '2px 4px',
                          },
                        }}
                      />
                    ) : (
                      <>
                        <Typography
                          sx={{
                            flex: 1,
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                          }}
                          onClick={() => handleEditSectionTitleStart(section.id, section.title)}
                        >
                          {section.title}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={() => handleEditSectionTitleStart(section.id, section.title)}
                          sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#1976d2' } }}
                        >
                          <EditIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </>
                    )}
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', pr: 1 }}>
                      {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={() => handleRemoveSection(section.id)}
                      sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#d32f2f' } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                  </Box>

                  {/* Section fields */}
                  {section.fields.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 2.5,
                        color: 'text.disabled',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Typography>No fields added yet</Typography>
                    </Box>
                  ) : (
                    <Box>
                      {section.fields.map((field) => (
                        <Box
                          key={field}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 1,
                            borderBottom: '1px solid rgba(226, 232, 255, 0.4)',
                            '&:last-child': { borderBottom: 'none' },
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>{field}</Typography>
                          <IconButton
                            size='small'
                            onClick={() => handleRemoveFieldFromSection(section.id, field)}
                            sx={{
                              p: 0.3,
                              opacity: 0.5,
                              '&:hover': { opacity: 1, color: '#d32f2f' },
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Add field to section */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderTop: '1px solid rgba(226, 232, 255, 0.4)',
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    <FieldSelector
                      fields={currentAvailable}
                      onChange={(val) => handleAddFieldToSection(section.id, val)}
                    />
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Footer actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant='outlined' sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button onClick={handleSave} variant='contained' sx={{ textTransform: 'none' }}>
          Save
        </Button>
      </DialogActions>

      {/* ── Add Custom Field Dialog ─────────────────────────────────── */}
      <CustomFieldFormDialog
        open={addFieldDialogOpen}
        editing={null}
        existingFields={currentAvailable.map(
          (name) =>
            ({ id: name, fieldName: name, fieldType: 'text', fieldUse: {} }) as ICustomField,
        )}
        ticketTypes={ticketTypes.map((tt) => ({
          type: tt.type,
          displayName: tt.displayName,
          name: tt.name,
        }))}
        defaultTicketType={ticketType?.type}
        accent='#0369a1'
        onClose={() => setAddFieldDialogOpen(false)}
        onSave={handleSaveCustomField}
      />
    </Dialog>
  );
};

// ── Field selector dropdown ─────────────────────────────────────────

const FieldSelector = ({
  fields,
  onChange,
}: {
  fields: string[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <Box ref={anchorRef} sx={{ position: 'relative', flex: 1 }}>
      <Tooltip title='Add field to section'>
        <Button
          variant='outlined'
          size='small'
          onClick={() => setOpen(!open)}
          sx={{
            justifyContent: 'space-between',
            minWidth: 0,
            flex: 1,
            textTransform: 'none',
            fontSize: '0.78rem',
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            {fields.length > 0 ? '+ Add field to section' : 'No fields available'}
          </Typography>
          <AddIcon sx={{ fontSize: '0.9rem', ml: 0.5 }} />
        </Button>
      </Tooltip>

      {open && fields.length > 0 && (
        <Box
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {fields.map((field) => (
            <Box
              key={field}
              onClick={() => {
                onChange(field);
                setOpen(false);
              }}
              sx={{
                px: 2,
                py: 1,
                fontSize: '0.85rem',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '&:first-of-type': { borderRadius: '4px 4px 0 0' },
                '&:last-of-type': { borderRadius: '0 0 4px 4px' },
              }}
            >
              {field}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TicketTypeLayoutDialog;
