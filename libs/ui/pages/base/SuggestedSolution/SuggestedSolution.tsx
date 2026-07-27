import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Button, Box } from '@serviceops/component';
import { useGetTicketsQuery, useCreateTicketMutation } from '../../../../services';
import { ICreateTicketInput, IAdminTicket } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import { useNotification, useDebounce } from '@serviceops/hooks';
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

/** Build a complete ticket body with all required fields for the generic create endpoint */
const buildTicketBody = (data: ICreateTicketInput, overrides: Partial<ICreateTicketInput> = {}): IAdminTicket => ({
  ...data,
  ...overrides,
} as IAdminTicket);

const SuggestedSolution = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { BasePath } = constants;
  const notify = useNotification();

  const ticketData = location.state?.ticketData as
    | (ICreateTicketInput & { number: string })
    | undefined;
  const ticketNumber = ticketData?.number ?? '';

  const [shortDesc, setShortDesc] = useState(ticketData?.shortDescription ?? '');
  const [issueText, setIssueText] = useState(stripHtml(ticketData?.description ?? ''));
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

  /** Fetch all tickets (returns all types); filter for resolved/closed client-side */
  const { data: allTickets = [], isLoading } = useGetTicketsQuery(void 0);
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const debouncedShort = useDebounce(shortDesc, 300);
  const debouncedDesc = useDebounce(issueText, 300);

  /** Client-side filter: only resolved/closed incidents */
  const resolvedIncidents = useMemo(
    () =>
      allTickets.filter(
        (t) => (t as any).ticketType === 'incident'
          && (t.status === 'resolved' || t.status === 'closed'),
      ),
    [allTickets],
  );

  const suggestedSolutions = useMemo(() => {
    const query = `${debouncedShort} ${debouncedDesc}`.trim();
    if (!query) return [];
    return resolvedIncidents
      .map((inc) => {
        const similarity = calculateSimilarity(
          query,
          `${inc.shortDescription ?? ''} ${stripHtml(inc.description ?? '')} ${(inc as any).notes ?? ''}`,
        );
        return { ticket: inc, similarity };
      })
      .filter(({ similarity }) => similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
  }, [debouncedShort, debouncedDesc, resolvedIncidents]);

  const total = suggestedSolutions.length;
  const safeIndex = Math.min(currentIndex, Math.max(0, total - 1));
  const current = total > 0 ? suggestedSolutions[safeIndex] : null;
  const selectedMatch = current?.ticket ?? null;
  const canApply = !!selectedMatch && markedUseful.has(selectedMatch.id);

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(total - 1, i + 1));
  const handleBack = () => navigate(-1);
  const handleCancel = () => navigate(BasePath.DASHBOARD);

  const handleSaveAsDraft = async () => {
    if (!ticketData) return;
    try {
      await createTicket(buildTicketBody(ticketData, { status: 'draft' })).unwrap();
      notify.success(`Draft ${ticketNumber} saved successfully!`);
      navigate(BasePath.DASHBOARD);
    } catch {
      notify.error('Failed to save draft. Please try again.');
    }
  };

  const handleApplyAndSubmit = async () => {
    if (!ticketData || !selectedMatch) return;
    try {
      await createTicket(
        buildTicketBody(ticketData, {
          status: 'resolved',
          notes: `[Applied from ${selectedMatch.number}] ${(selectedMatch as any).notes || selectedMatch.description || 'Existing solution applied.'}`,
        }),
      ).unwrap();
      notify.success(`Ticket ${ticketNumber} resolved using existing solution!`);
      navigate(BasePath.INCIDENT_MANAGEMENT);
    } catch {
      notify.error('Failed to create ticket. Please try again.');
    }
  };

  const handleCreateNew = async () => {
    if (!ticketData) return;
    try {
      await createTicket(buildTicketBody(ticketData, { status: 'new' })).unwrap();
      notify.success(`Ticket ${ticketNumber} created successfully!`);
      navigate(BasePath.INCIDENT_MANAGEMENT);
    } catch {
      notify.error('Failed to create ticket. Please try again.');
    }
  };

  if (!ticketData) {
    return (
      <Box className={classes.container}>
        <Alert severity='warning' sx={{ borderRadius: 3 }}>
          No ticket data found. Please create a ticket first.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant='contained'
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(BasePath.CREATE_TICKET)}
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
          current={current as any}
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
        onCreateNew={handleCreateNew}
        onApplyAndSubmit={handleApplyAndSubmit}
      />
    </Box>
  );
};

export default SuggestedSolution;
