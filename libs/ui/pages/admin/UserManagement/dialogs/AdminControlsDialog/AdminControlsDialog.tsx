import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { useStyles } from './styles';
import { PageStyles } from '../../types/userManagement.types';

const THEMES: { name: string; swatch: string; accent: string }[] = [
  { name: 'System', swatch: 'linear-gradient(135deg,#2d5ebb,#e2e8f0)', accent: '#2d5ebb' },
  { name: 'Black and White', swatch: 'linear-gradient(135deg,#111827,#f9fafb)', accent: '#111827' },
  { name: 'Blimey', swatch: 'linear-gradient(135deg,#92400e,#f59e0b)', accent: '#92400e' },
  { name: 'Blues', swatch: 'linear-gradient(135deg,#0369a1,#38bdf8)', accent: '#0369a1' },
  { name: 'Clean', swatch: 'linear-gradient(135deg,#0284c7,#0ea5e9)', accent: '#0284c7' },
  { name: 'Cobalt', swatch: 'linear-gradient(135deg,#312e81,#a5b4fc)', accent: '#312e81' },
  {
    name: 'Cobalt Contrast UI',
    swatch: 'linear-gradient(135deg,#0f2463,#60a5fa)',
    accent: '#0f2463',
  },
  { name: 'Contrast UI', swatch: 'linear-gradient(135deg,#1c1c1c,#facc15)', accent: '#1c1c1c' },
  { name: 'Midnight', swatch: 'linear-gradient(135deg,#1e1b4b,#7c3aed)', accent: '#1e1b4b' },
  { name: 'Rose', swatch: 'linear-gradient(135deg,#881337,#f43f5e)', accent: '#881337' },
  { name: 'Forest', swatch: 'linear-gradient(135deg,#064e3b,#34d399)', accent: '#064e3b' },
];

interface AdminControlsDialogProps {
  open: boolean;
  onClose: () => void;
  adminTwoLevel: boolean;
  onAdminTwoLevelChange: (v: boolean) => void;
  adminManagerOnly: boolean;
  onAdminManagerOnlyChange: (v: boolean) => void;
  adminAdditionalApproval: boolean;
  onAdminAdditionalApprovalChange: (v: boolean) => void;
  adminApprover: string;
  onAdminApproverChange: (v: string) => void;
  onAdminApproverBlur?: () => void;
  isSaving?: boolean;
  pageStyles: PageStyles;
  onPageStyleChange: (page: 'signIn' | 'signUp' | 'forgotPassword', value: 'old' | 'new') => void;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

const AdminControlsDialog = ({
  open,
  onClose,
  adminTwoLevel,
  onAdminTwoLevelChange,
  adminManagerOnly,
  onAdminManagerOnlyChange,
  adminAdditionalApproval,
  onAdminAdditionalApprovalChange,
  adminApprover,
  onAdminApproverChange,
  onAdminApproverBlur,
  isSaving = false,
  pageStyles,
  onPageStyleChange,
  selectedTheme,
  onThemeChange,
}: AdminControlsDialogProps) => {
  const { classes } = useStyles();

  const activeCount = [adminTwoLevel, adminManagerOnly, adminAdditionalApproval].filter(
    Boolean,
  ).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{ paper: { className: classes.dialogPaper } }}
    >
      {/* ── Header ── */}
      <Box className={classes.header}>
        <Box className={classes.headerIconWrap}>
          <TuneIcon className={classes.headerIcon} />
        </Box>
        <Box className={classes.headerTextBox}>
          <Typography className={classes.headerTitle}>Admin Controls</Typography>
          <Typography className={classes.headerSubtitle}>Workflows · Styles · Theme</Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={1}>
          {/* Auto-save indicator */}
          {isSaving ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CircularProgress size={13} thickness={5} sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Saving…
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.55 }}>
              <CloudDoneIcon sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Auto-saved
              </Typography>
            </Box>
          )}
          {activeCount > 0 && (
            <Chip label={`${activeCount} active`} size='small' className={classes.headerChip} />
          )}
          <IconButton size='small' onClick={onClose} className={classes.headerCloseBtn}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      <DialogContent className={classes.dialogContent}>
        {/* ── Section 1: Approval Settings ── */}
        <Accordion
          className={classes.accordion}
          defaultExpanded={false}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
            className={classes.accordionSummary}
          >
            <Box className={classes.accordionSummaryInner}>
              <Box className={`${classes.sectionIconCircle} ${classes.sectionIconBlue}`}>
                <SecurityIcon className={classes.sectionIconWhite} />
              </Box>
              <Box>
                <Typography className={classes.accordionTitle}>Approval Settings</Typography>
                <Typography className={classes.accordionSubtitle}>
                  Configure approval workflows for new account registrations
                </Typography>
              </Box>
              {activeCount > 0 && <CheckCircleIcon className={classes.activeCheckIcon} />}
            </Box>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={adminTwoLevel}
                  onChange={(e) => onAdminTwoLevelChange(e.target.checked)}
                  size='small'
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight={500}>
                    Enable two-level approval by manager and admin
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Level 1: Reporting manager. Level 2: Any one admin (or define one below).
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 1.5 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={adminManagerOnly}
                  onChange={(e) => onAdminManagerOnlyChange(e.target.checked)}
                  size='small'
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight={500}>
                    Manager approval only for end users
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Manager field becomes mandatory on sign-up.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 1.5 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={adminAdditionalApproval}
                  onChange={(e) => onAdminAdditionalApprovalChange(e.target.checked)}
                  size='small'
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight={500}>
                    Admin user requires additional approval
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Define an approver who must approve admin account creations.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
            {adminAdditionalApproval && (
              <TextField
                label='Approver for Admin Accounts'
                fullWidth
                size='small'
                placeholder='e.g. Director of IT'
                value={adminApprover}
                onChange={(e) => onAdminApproverChange(e.target.value)}
                onBlur={onAdminApproverBlur}
                helperText='This person will approve all new admin account requests'
                sx={{ mt: 1.5 }}
              />
            )}
          </AccordionDetails>
        </Accordion>

        {/* ── Section 2: Page Styles ── */}
        <Accordion
          className={classes.accordion}
          defaultExpanded={false}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
            className={classes.accordionSummary}
          >
            <Box className={classes.accordionSummaryInner}>
              <Box className={`${classes.sectionIconCircle} ${classes.sectionIconPurple}`}>
                <PaletteIcon className={classes.sectionIconWhite} />
              </Box>
              <Box>
                <Typography className={classes.accordionTitle}>Page Layout Design</Typography>
                <Typography className={classes.accordionSubtitle}>
                  Sign In, Sign Up &amp; Forgot Password layout designs
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            {(['signIn', 'signUp', 'forgotPassword'] as const).map((page) => {
              const labels: Record<string, { title: string; desc: string }> = {
                signIn: {
                  title: 'Sign In Page',
                  desc: 'Old: centered card · New: split gradient + feature panel',
                },
                signUp: {
                  title: 'Sign Up Page',
                  desc: 'Old: single-step form · New: 3-step wizard',
                },
                forgotPassword: {
                  title: 'Forgot Password Page',
                  desc: 'Old: simple email form · New: 3-step OTP recovery',
                },
              };
              return (
                <Box key={page} className={classes.pageStyleBox}>
                  <Typography variant='body2' fontWeight={600} sx={{ mb: 0.5 }}>
                    {labels[page].title}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    sx={{ mb: 1 }}
                  >
                    {labels[page].desc}
                  </Typography>
                  <RadioGroup
                    row
                    value={pageStyles[page]}
                    onChange={(e) => onPageStyleChange(page, e.target.value as 'old' | 'new')}
                  >
                    <FormControlLabel
                      value='old'
                      control={<Radio size='small' />}
                      label={<Typography variant='body2'>Old</Typography>}
                    />
                    <FormControlLabel
                      value='new'
                      control={<Radio size='small' />}
                      label={<Typography variant='body2'>New</Typography>}
                    />
                  </RadioGroup>
                </Box>
              );
            })}
          </AccordionDetails>
        </Accordion>

        {/* ── Section 3: Theme Selection ── */}
        <Accordion className={classes.accordion} defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
            className={classes.accordionSummary}
          >
            <Box className={classes.accordionSummaryInner}>
              <Box className={`${classes.sectionIconCircle} ${classes.sectionIconTeal}`}>
                <ColorLensIcon className={classes.sectionIconWhite} />
              </Box>
              <Box flex={1}>
                <Typography className={classes.accordionTitle}>Theme Selection</Typography>
                <Typography className={classes.accordionSubtitle}>
                  Applied instantly · Synced across all sessions
                </Typography>
              </Box>
              <Chip label={selectedTheme} size='small' className={classes.activeThemeChip} />
            </Box>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <Box className={classes.themeGrid}>
              {THEMES.map((t) => {
                const isSelected = selectedTheme === t.name;
                return (
                  <Box
                    key={t.name}
                    className={`${classes.themeCard} ${isSelected ? classes.themeCardSelected : ''}`}
                    onClick={() => onThemeChange(t.name)}
                  >
                    <Box className={classes.themeSwatch} sx={{ background: t.swatch }} />
                    <Typography className={classes.themeCardLabel}>{t.name}</Typography>
                    {isSelected && (
                      <CheckCircleIcon
                        className={classes.themeCheckIcon}
                        sx={{ color: t.accent, fontSize: 18 }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto', pl: 0.5 }}>
          {isSaving ? (
            <>
              <CircularProgress size={14} thickness={5} color='primary' />
              <Typography variant='caption' color='text.secondary'>Saving changes…</Typography>
            </>
          ) : (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CloudDoneIcon sx={{ fontSize: '0.85rem', color: 'success.main' }} />
              All changes auto-saved
            </Typography>
          )}
        </Box>
        <Button variant='contained' onClick={onClose} sx={{ borderRadius: 2 }} disabled={isSaving}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminControlsDialog;
