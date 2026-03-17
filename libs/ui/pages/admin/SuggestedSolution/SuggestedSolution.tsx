import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box } from '@picks/component';
import { useGetIncidentsQuery, useCreateIncidentMutation } from '../../../../services';
import { IncidentStatus, ICreateIncidentInput } from '../../../../entities/interfaces';
import { constants } from '@picks/utils';
import { useNotification, useDebounce } from '@picks/hooks';
import { useStyles } from './styles';
import { HeroBanner, InputColumn, SolutionViewer, ActionButtons } from './components';

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

const calculateSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2) return 0;
  const tokenize = (t: string) =>
    t
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
  const words1 = tokenize(text1);
  const words2 = tokenize(text2);
  if (words1.length === 0 || words2.length === 0) return 0;
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  let matchCount = 0;
  set1.forEach((w) => {
    if (set2.has(w)) matchCount++;
  });
  const union = new Set([...words1, ...words2]).size;
  return Math.min(100, Math.round((matchCount / union) * 100));
};

const SuggestedSolution = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { AdminPath } = constants;
  const notify = useNotification();

  const incidentData = location.state?.incidentData as
    | (ICreateIncidentInput & { number: string })
    | undefined;
  const ticketNumber = incidentData?.number ?? '';

  const [shortDesc, setShortDesc] = useState(incidentData?.shortDescription ?? '');
  const [issueText, setIssueText] = useState(stripHtml(incidentData?.description ?? ''));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedUseful, setMarkedUseful] = useState<Set<number>>(new Set());

  const toggleUseful = useCallback((id: number) => {
    setMarkedUseful((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const { data: allIncidents = [], isLoading } = useGetIncidentsQuery();
  const [createIncident, { isLoading: isSubmitting }] = useCreateIncidentMutation();

  const debouncedShort = useDebounce(shortDesc, 300);
  const debouncedDesc = useDebounce(issueText, 300);

  const resolvedIncidents = useMemo(
    () =>
      allIncidents.filter(
        (i) => i.status === IncidentStatus.RESOLVED || i.status === IncidentStatus.CLOSED,
      ),
    [allIncidents],
  );

  const suggestedSolutions = useMemo(() => {
    const query = `${debouncedShort} ${debouncedDesc}`.trim();
    if (!query) return [];
    return resolvedIncidents
      .map((inc) => {
        const similarity = calculateSimilarity(
          query,
          `${inc.shortDescription ?? ''} ${stripHtml(inc.description ?? '')} ${inc.notes ?? ''}`,
        );
        return { incident: inc, similarity };
      })
      .filter(({ similarity }) => similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
  }, [debouncedShort, debouncedDesc, resolvedIncidents]);

  const total = suggestedSolutions.length;
  const safeIndex = Math.min(currentIndex, Math.max(0, total - 1));
  const current = total > 0 ? suggestedSolutions[safeIndex] : null;
  const selectedMatch = current?.incident ?? null;
  const canApply = !!selectedMatch && markedUseful.has(selectedMatch.id);

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(total - 1, i + 1));
  const handleBack = () => navigate(-1);
  const handleCancel = () => navigate(AdminPath.DASHBOARD);

  const handleSaveAsDraft = async () => {
    if (!incidentData) return;
    try {
      await createIncident({ ...incidentData, status: IncidentStatus.DRAFT }).unwrap();
      notify.success(`Draft ${ticketNumber} saved successfully!`);
      navigate(AdminPath.DASHBOARD);
    } catch {
      notify.error('Failed to save draft. Please try again.');
    }
  };

  const handleApplyAndSubmit = async () => {
    if (!incidentData || !selectedMatch) return;
    try {
      await createIncident({
        ...incidentData,
        status: IncidentStatus.RESOLVED,
        notes: `[Applied from ${selectedMatch.number}] ${selectedMatch.notes || selectedMatch.description || 'Existing solution applied.'}`,
      }).unwrap();
      notify.success(`Incident ${ticketNumber} resolved using existing solution!`);
      navigate(AdminPath.INCIDENT_MANAGEMENT);
    } catch {
      notify.error('Failed to create incident. Please try again.');
    }
  };

  const handleCreateIncident = async () => {
    if (!incidentData) return;
    try {
      await createIncident({ ...incidentData, status: IncidentStatus.NEW }).unwrap();
      notify.success(`Incident ${ticketNumber} created successfully!`);
      navigate(AdminPath.INCIDENT_MANAGEMENT);
    } catch {
      notify.error('Failed to create incident. Please try again.');
    }
  };

  if (!incidentData) {
    return (
      <Box className={classes.container}>
        <Alert severity='warning' sx={{ borderRadius: 3 }}>
          No incident data found. Please create an incident first.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant='contained'
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(AdminPath.CREATE_TICKET)}
          >
            Go to Create Ticket
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <HeroBanner
        ticketNumber={ticketNumber}
        resolvedCount={resolvedIncidents.length}
        matchCount={total}
      />

      <Box className={classes.mainGrid}>
        <InputColumn
          shortDesc={shortDesc}
          issueText={issueText}
          onShortDescChange={(val) => {
            setShortDesc(val);
            setCurrentIndex(0);
          }}
          onIssueTextChange={(val) => {
            setIssueText(val);
            setCurrentIndex(0);
          }}
        />

        <SolutionViewer
          isLoading={isLoading}
          current={current}
          safeIndex={safeIndex}
          total={total}
          shortDesc={shortDesc}
          issueText={issueText}
          markedUseful={markedUseful}
          onPrev={handlePrev}
          onNext={handleNext}
          onToggleUseful={toggleUseful}
        />
      </Box>

      <ActionButtons
        canApply={canApply}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onCancel={handleCancel}
        onSaveAsDraft={handleSaveAsDraft}
        onCreateNew={handleCreateIncident}
        onApplyAndSubmit={handleApplyAndSubmit}
      />
    </Box>
  );
};

export default SuggestedSolution;
