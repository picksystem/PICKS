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
} from '@serviceops/component';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
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

const TAB_ORDER: TabId[] = ['createTicket', 'ticketDetails'];

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
  /** All ticket types so the Add/Edit Custom Field dialog can show per-type checkboxes. */
  ticketTypes?: ITicketType[];
  onClose: () => void;
  /** Called with the full layout payload when the user clicks Save.
   *  The parent is responsible for persisting to the API. */
  onSave: (payload: {
    createTicket: {
      ticketFields: string[];
      ticketSections: { title: string; fields: string[] }[];
    };
    ticketDetails: {
      ticketFields: string[];
      ticketSections: { title: string; fields: string[] }[];
    };
  }) => void;
}

// ── Component ──────────────────────────────────────────────────────

export const TicketTypeLayoutDialog = ({
  open,
  ticketType,
  ticketTypes = [],
  onClose,
  onSave,
}: TicketTypeLayoutDialogProps) => {
  const [activeTabIdx, setActiveTabIdx] = useState<0 | 1>(0);
  const activeTab: TabId = TAB_ORDER[activeTabIdx];
  const { error: notifyError } = useNotification();

  // Custom field dialogs
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ICustomField | null>(null);

  // Section title input
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSectionInput, setShowSectionInput] = useState(false);

  // Sections per tab
  const [sections, setSections] = useState<Record<TabId, Section[]>>({
    createTicket: [],
    ticketDetails: [],
  });

  // Available fields per tab — stores full ICustomField objects so the
  // edit dialog can pre-populate all field properties.
  const [availableFields, setAvailableFields] = useState<Record<TabId, ICustomField[]>>({
    createTicket: [],
    ticketDetails: [],
  });

  // Edit mode for section titles
  const [editingSection, setEditingSection] = useState<{ id: string; temp: string } | null>(null);
  const sectionTitleInputRef = useRef<HTMLInputElement>(null);

  const currentSections = sections[activeTab] ?? [];
  const currentAvailable = availableFields[activeTab] ?? [];

  // Just the field names (for display in sections, FieldSelector, etc.)
  const currentFieldNames = useMemo(
    () => currentAvailable.map((f) => f.fieldName),
    [currentAvailable],
  );

  // All fields currently assigned across all sections
  const assignedFields = useMemo(() => currentSections.flatMap((s) => s.fields), [currentSections]);

  // Auto-focus inline section title inputs
  useEffect(() => {
    if (showSectionInput && sectionTitleInputRef.current) {
      sectionTitleInputRef.current.focus();
      sectionTitleInputRef.current.select();
    }
  }, [showSectionInput]);

  // ── Field Handlers ───────────────────────────────────────────────

  const handleSaveCustomField = useCallback(
    (field: ICustomField) => {
      const tabsToUpdate: TabId[] = [];
      if (field.fieldUse?.__createTicket__) tabsToUpdate.push('createTicket');
      if (field.fieldUse?.__ticketDetails__) tabsToUpdate.push('ticketDetails');
      if (tabsToUpdate.length === 0) tabsToUpdate.push(activeTab);

      setAvailableFields((prev) => {
        const next = { ...prev };
        for (const tab of tabsToUpdate) {
          const idx = next[tab].findIndex((f) => f.fieldName === field.fieldName);
          if (idx >= 0) {
            // Update existing field (edit mode)
            next[tab] = [...next[tab]];
            next[tab][idx] = field;
          } else {
            // Add new field
            next[tab] = [...next[tab], field];
          }
        }
        return next;
      });

      setAddFieldDialogOpen(false);
    },
    [activeTab],
  );

  const handleEditField = useCallback((field: ICustomField) => {
    setEditingField(field);
  }, []);

  const handleEditFieldSave = useCallback(
    (updated: ICustomField) => {
      const tabsToUpdate: TabId[] = [];
      if (updated.fieldUse?.__createTicket__) tabsToUpdate.push('createTicket');
      if (updated.fieldUse?.__ticketDetails__) tabsToUpdate.push('ticketDetails');
      if (tabsToUpdate.length === 0) tabsToUpdate.push(activeTab);

      setAvailableFields((prev) => {
        const next = { ...prev };
        for (const tab of tabsToUpdate) {
          const idx = next[tab].findIndex((f) => f.fieldName === updated.fieldName);
          if (idx >= 0) {
            next[tab] = [...next[tab]];
            next[tab][idx] = updated;
          }
        }
        return next;
      });

      setEditingField(null);
    },
    [activeTab],
  );

  const handleRemoveField = useCallback(
    (fieldName: string) => {
      setAvailableFields((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((f) => f.fieldName !== fieldName),
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

  const handleDismissSectionInput = useCallback(() => {
    setShowSectionInput(false);
    setNewSectionTitle('');
  }, []);

  // ── Section Field Handlers ───────────────────────────────────────

  const handleAddFieldToSection = useCallback(
    (sectionId: string, fieldName: string) => {
      if (!fieldName) return;
      setAvailableFields((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((f) => f.fieldName !== fieldName),
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
      createTicket: {
        ticketFields: currentFieldNames,
        ticketSections:
          sections.createTicket?.map((s) => ({
            title: s.title,
            fields: [...s.fields],
          })) ?? [],
      },
      ticketDetails: {
        ticketFields: availableFields.ticketDetails?.map((f) => f.fieldName) ?? [],
        ticketSections:
          sections.ticketDetails?.map((s) => ({
            title: s.title,
            fields: [...s.fields],
          })) ?? [],
      },
    };
    onSave(payload);
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
          value={activeTabIdx}
          onChange={(_, v) => setActiveTabIdx(v)}
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
        {/* Left Panel: Fields */}
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
          {/* Fields header */}
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
            <Typography sx={columnLabelSx}>
              {activeTab === 'createTicket' ? 'Create Ticket Fields' : 'Ticket Detail Fields'}
            </Typography>
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
            {currentFieldNames.length === 0 ? (
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
              currentAvailable.map((field) => (
                <Box
                  key={field.id}
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
                  <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>{field.fieldName}</Typography>
                  <Tooltip title='Edit field'>
                    <IconButton
                      size='small'
                      onClick={() => handleEditField(field)}
                      sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#1976d2' } }}
                    >
                      <EditIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size='small'
                    onClick={() => handleRemoveField(field.fieldName)}
                    sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#d32f2f' } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Right Panel: Sections */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: 380, md: 520 },
            bgcolor: 'background.paper',
          }}
        >
          {/* Sections header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
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

          {/* Sections body */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {showSectionInput && (
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderBottom: '1px solid rgba(226, 232, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: alpha('#0369a1', 0.02),
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    inputRef={sectionTitleInputRef}
                    size='small'
                    placeholder='Enter section title...'
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
                        handleDismissSectionInput();
                      }
                    }}
                    fullWidth
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: 'background.paper',
                        borderRadius: 1.5,
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                </Box>
                <Tooltip title='Submit'>
                  <IconButton
                    size='small'
                    onClick={() => {
                      const title = newSectionTitle.trim();
                      if (title) {
                        handleAddSectionWithTitle(title);
                      }
                      setShowSectionInput(false);
                      setNewSectionTitle('');
                    }}
                    sx={{
                      p: 0.7,
                      color: newSectionTitle.trim() ? 'primary.main' : 'text.disabled',
                      '&:hover': {
                        color: 'primary.dark',
                        bgcolor: 'rgba(3, 105, 161, 0.08)',
                      },
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Cancel'>
                  <IconButton
                    size='small'
                    onClick={handleDismissSectionInput}
                    sx={{
                      p: 0.7,
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#d32f2f',
                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {currentSections.length === 0 ? (
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
                No sections yet. Click '+ Add New Section' to create one.
              </Box>
            ) : (
              currentSections.map((section, sectionIndex) => {
                const isEditing = editingSection?.id === section.id;

                return (
                  <Box key={section.id}>
                    {/* Section header row */}
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.4,
                        borderTop:
                          sectionIndex === 0 ? 'none' : '1px solid rgba(226, 232, 255, 0.6)',
                        borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: alpha('#0369a1', 0.04),
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Box sx={{ flex: 1 }}>
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
                              size='small'
                              sx={{
                                '& .MuiInputBase-root': {
                                  bgcolor: 'background.paper',
                                  borderRadius: 1.5,
                                },
                                '& .MuiInputBase-input': {
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  padding: '4px 8px',
                                },
                              }}
                            />
                          </Box>
                          <Tooltip title='Submit'>
                            <IconButton
                              size='small'
                              onClick={handleEditSectionTitleSave}
                              sx={{
                                p: 0.7,
                                color: editingSection.temp.trim()
                                  ? 'primary.main'
                                  : 'text.disabled',
                                '&:hover': {
                                  color: 'primary.dark',
                                  bgcolor: 'rgba(3, 105, 161, 0.08)',
                                },
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Cancel'>
                            <IconButton
                              size='small'
                              onClick={handleEditSectionTitleCancel}
                              sx={{
                                p: 0.7,
                                color: 'text.secondary',
                                '&:hover': {
                                  color: '#d32f2f',
                                  bgcolor: 'rgba(211, 47, 47, 0.08)',
                                },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              flex: 1,
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.main' },
                            }}
                            onClick={() => handleEditSectionTitleStart(section.id, section.title)}
                          >
                            {section.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              fontWeight: 500,
                              mr: 0.5,
                            }}
                          >
                            {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={() => handleEditSectionTitleStart(section.id, section.title)}
                            sx={{
                              p: 0.3,
                              opacity: 0.5,
                              '&:hover': { opacity: 1, color: '#1976d2' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={() => handleRemoveSection(section.id)}
                            sx={{
                              p: 0.3,
                              opacity: 0.5,
                              '&:hover': { opacity: 1, color: '#d32f2f' },
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </>
                      )}
                    </Box>

                    {/* Section fields */}
                    {section.fields.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: 2,
                          color: 'text.disabled',
                          fontSize: '0.8rem',
                        }}
                      >
                        No fields added yet
                      </Box>
                    ) : (
                      <Box>
                        {section.fields.map((fieldName) => (
                          <Box
                            key={fieldName}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              px: 2.5,
                              py: 1.2,
                              borderBottom: '1px solid rgba(226, 232, 255, 0.4)',
                              '&:last-child': { borderBottom: 'none' },
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>
                              {fieldName}
                            </Typography>
                            <IconButton
                              size='small'
                              onClick={() => handleRemoveFieldFromSection(section.id, fieldName)}
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
                    {currentFieldNames.length > 0 && (
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.2,
                          borderTop: '1px solid rgba(226, 232, 255, 0.4)',
                          borderBottom:
                            sectionIndex === currentSections.length - 1
                              ? 'none'
                              : '1px solid rgba(226, 232, 255, 0.6)',
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <FieldSelector
                          fields={currentFieldNames}
                          onChange={(val) => handleAddFieldToSection(section.id, val)}
                        />
                      </Box>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
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
        existingFields={currentAvailable}
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

      {/* ── Edit Custom Field Dialog ────────────────────────────────── */}
      <CustomFieldFormDialog
        open={!!editingField}
        editing={editingField}
        existingFields={currentAvailable}
        ticketTypes={ticketTypes.map((tt) => ({
          type: tt.type,
          displayName: tt.displayName,
          name: tt.name,
        }))}
        defaultTicketType={ticketType?.type}
        accent='#0369a1'
        onClose={() => setEditingField(null)}
        onSave={handleEditFieldSave}
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

  return (
    <Box sx={{ position: 'relative', flex: 1 }}>
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
          {fields.map((fieldName) => (
            <Box
              key={fieldName}
              onClick={() => {
                onChange(fieldName);
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
              {fieldName}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TicketTypeLayoutDialog;
