import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import { useAuth, useAppNavigation } from '@serviceops/hooks';
import { useAppRole } from '@serviceops/theme';
import { useGetLeaveBalanceQuery, useGetLeaveRequestsQuery } from '@serviceops/services';
import { answerQuestion, type BotLink, type BotReply } from './botKnowledge';

/* The bot's name lives in one place — every label and greeting below reads
   from it, so renaming the assistant is a one-line change. */
export const BOT_NAME = 'Bot';

const GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';

/* ── Animated bot avatar (pure SVG + CSS, no image / no package). A
   friendly robot face on the brand purple: the eyes blink on a loop and
   the antenna light pulses; `float` gives the big floating button a
   gentle bob. Sized via `size` (px). */
export const BotAvatar = ({
  size,
  float = false,
  bordered = false,
}: {
  size: number;
  float?: boolean;
  bordered?: boolean;
}) => (
  <Box
    className={float ? 'airaBotAvatarFloat' : undefined}
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: '50%',
      background: GRADIENT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(109,40,217,0.45)',
      border: bordered ? '3px solid #fff' : 'none',
      overflow: 'hidden',
    }}
  >
    <svg
      width={size * 0.64}
      height={size * 0.64}
      viewBox='0 0 100 100'
      aria-hidden
      focusable='false'
    >
      {/* Antenna + pulsing light */}
      <line x1='50' y1='16' x2='50' y2='28' stroke='#fff' strokeWidth='4' strokeLinecap='round' />
      <circle cx='50' cy='12' r='5' fill='#fbbf24' className='airaBotLight' />
      {/* Head */}
      <rect x='20' y='28' width='60' height='48' rx='18' fill='#ffffff' />
      {/* Side bolts */}
      <rect x='12' y='46' width='8' height='14' rx='4' fill='#ddd6fe' />
      <rect x='80' y='46' width='8' height='14' rx='4' fill='#ddd6fe' />
      {/* Face plate */}
      <rect x='28' y='36' width='44' height='32' rx='12' fill='#6d28d9' />
      {/* Eyes (blink) */}
      <circle cx='42' cy='50' r='5.5' fill='#fff' className='airaBotEye' />
      <circle cx='58' cy='50' r='5.5' fill='#fff' className='airaBotEye' />
      {/* Smile */}
      <path
        d='M42 60 Q50 66 58 60'
        stroke='#fff'
        strokeWidth='3.5'
        strokeLinecap='round'
        fill='none'
      />
    </svg>
  </Box>
);

/* ── Monochrome bot face for the header toolbar. Renders in `currentColor`
   (white on the dark header) and scales with font-size, so it sits at the
   same 1.25em size and matches the colour of the neighbouring toolbar
   icons. Eyes still blink, antenna still pulses. */
export const BotIcon = ({ size = '1.25em', className }: { size?: string; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 100 100'
    aria-hidden
    focusable='false'
    className={className}
    style={{ color: 'currentColor', display: 'block' }}
  >
    {/* Antenna + pulsing light */}
    <line
      x1='50'
      y1='16'
      x2='50'
      y2='28'
      stroke='currentColor'
      strokeWidth='5'
      strokeLinecap='round'
    />
    <circle cx='50' cy='11' r='5.5' fill='currentColor' className='airaBotLight' />
    {/* Head outline */}
    <rect
      x='20'
      y='28'
      width='60'
      height='48'
      rx='18'
      fill='none'
      stroke='currentColor'
      strokeWidth='6'
    />
    {/* Side bolts */}
    <line
      x1='20'
      y1='48'
      x2='20'
      y2='56'
      stroke='currentColor'
      strokeWidth='6'
      strokeLinecap='round'
    />
    <line
      x1='80'
      y1='48'
      x2='80'
      y2='56'
      stroke='currentColor'
      strokeWidth='6'
      strokeLinecap='round'
    />
    {/* Eyes (blink) */}
    <circle cx='42' cy='50' r='6' fill='currentColor' className='airaBotEye' />
    <circle cx='58' cy='50' r='6' fill='currentColor' className='airaBotEye' />
    {/* Smile */}
    <path
      d='M42 60 Q50 67 58 60'
      stroke='currentColor'
      strokeWidth='5'
      strokeLinecap='round'
      fill='none'
    />
  </svg>
);

interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
  /** Deep links the bot suggests with this reply (rendered as buttons). */
  links?: BotLink[];
}

/* ── End-to-end answer engine lives in `botKnowledge.ts`: one knowledge
   base entry per ServiceOps module (tickets, incidents, changes, problems,
   timesheets, leave, approvals, reports, KB, cabs, users, config...), each
   with a how-it-works explanation + a role-aware deep link into the page
   that owns it. Live leave data (balances + requests) is checked first. ── */

const HrChatbot = ({
  open,
  dismissed,
  onDismiss,
  onClose,
  onOpenChange,
}: {
  open: boolean;
  /** True when the user pressed the bubble's cancel (×) — the whole
      floating bot (avatar + bubble) stays hidden until the header's
      "Ask Aria" icon brings it back. */
  dismissed: boolean;
  onDismiss: () => void;
  /** Close button inside the open panel: hides the panel AND the
      floating bot (the header icon brings either back). */
  onClose: () => void;
  onOpenChange: (o: boolean) => void;
}) => {
  const { user } = useAuth();
  const role = useAppRole();
  const { navigateToPath } = useAppNavigation();
  /* Live leave data — the engine answers balance/request questions with
     the app's real records, not canned text. */
  const { data: leaveBalance = [] } = useGetLeaveBalanceQuery();
  const { data: leaveRequests = [] } = useGetLeaveRequestsQuery();

  const fullName =
    user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'there';
  const firstName = fullName.split(' ')[0] || 'there';

  /* "SP"-style two-letter chip for the user's messages. */
  const userInitials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'U';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  /* Greet the user the first time the panel opens. */
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: nextId(), from: 'bot', text: `Hi ${fullName}, how can I assist you today?` },
      ]);
    }
  }, [open, messages.length, fullName]);

  /* Keep the newest message in view. */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  /* End-to-end answer: live leave data first, then the knowledge base,
     then a helpful fallback — all in `botKnowledge.ts`. */
  const replyTo = useCallback(
    (text: string): BotReply => answerQuestion(text, firstName, role, leaveBalance, leaveRequests),
    [firstName, role, leaveBalance, leaveRequests],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      setMessages((m) => [...m, { id: nextId(), from: 'user', text }]);
      setInput('');
      setTyping(true);
      timerRef.current = setTimeout(() => {
        const reply = replyTo(text);
        setMessages((m) => [
          ...m,
          { id: nextId(), from: 'bot', text: reply.text, links: reply.links },
        ]);
        setTyping(false);
      }, 650);
    },
    [replyTo],
  );

  const clearChat = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([]);
    setInput('');
  }, []);

  return (
    <>
      {/* ── Floating avatar button + intro speech bubble (bottom-right).
          Hidden while the panel is open OR after the user presses the
          bubble's cancel (×) — the header's "Ask Aria" icon brings it
          back (Header clears `dismissed` on click). ── */}
      {!open && !dismissed && (
        <Stack
          direction='row'
          alignItems='flex-end'
          justifyContent='flex-end'
          spacing={1.5}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
        >
          {/* Intro speech bubble. Its cancel (×) hides the whole floating
              bot (avatar + bubble) until the header icon brings it back. */}
          <Box
            sx={{
              position: 'relative',
              minWidth: 220,
              maxWidth: 260,
              background: GRADIENT,
              borderRadius: '14px 14px 4px 14px',
              padding: '12px 30px 12px 14px',
              color: '#fff',
              boxShadow: '0 6px 18px rgba(109,40,217,0.45)',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
              Hi I am {BOT_NAME}, Ask me anything about ServiceOps.
            </Typography>
            {/* Little bubble tail pointing at the avatar */}
            <Box
              sx={{
                position: 'absolute',
                right: 10,
                bottom: -6,
                width: 12,
                height: 12,
                background: GRADIENT,
                transform: 'rotate(45deg)',
                borderRadius: 2,
              }}
            />
            <IconButton
              size='small'
              onClick={onDismiss}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                p: 0,
                color: 'rgba(255,255,255,0.85)',
                bgcolor: 'rgba(255,255,255,0.18)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.32)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>

          <Tooltip title={`Ask ${BOT_NAME} — ServiceOps assistant`} placement='left'>
            <Box
              onClick={() => onOpenChange(true)}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <BotAvatar size={62} float bordered />
              {/* Green "online" dot */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: '#22c55e',
                  border: '2px solid #fff',
                }}
              />
            </Box>
          </Tooltip>
        </Stack>
      )}

      {/* ── Chat panel (replaces the floating button while open) ── */}
      {open && (
        <Box
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            height: 500,
            maxHeight: 'calc(100vh - 40px)',
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(30,42,94,0.35)',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
          }}
        >
          {/* Purple gradient header: avatar + "Ask AIRA" + pin / clear / close */}
          <Stack
            direction='row'
            alignItems='center'
            spacing={1}
            sx={{ background: GRADIENT, px: 1.5, py: 1.25, color: '#fff' }}
          >
            <BotAvatar size={34} bordered />
            <Typography sx={{ fontWeight: 700, fontSize: 15, flexGrow: 1 }}>
              Ask {BOT_NAME.toUpperCase()}
            </Typography>
            <Tooltip title='HR portal' placement='bottom'>
              <IconButton
                size='small'
                sx={{ p: 0.25, color: '#fff', '&:hover': { color: '#fff' } }}
              >
                <PlaceIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Clear conversation' placement='bottom'>
              <IconButton
                size='small'
                onClick={clearChat}
                sx={{ p: 0.25, color: '#fff', '&:hover': { color: '#fff' } }}
              >
                <DeleteIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Close' placement='bottom'>
              <IconButton
                size='small'
                onClick={onClose}
                sx={{ p: 0.25, color: '#fff', '&:hover': { color: '#fff' } }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Messages */}
          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              px: 1.5,
              py: 1.5,
              backgroundColor: '#fafafa',
            }}
          >
            {messages.map((m) =>
              m.from === 'bot' ? (
                <Stack key={m.id} direction='row' spacing={1} sx={{ mb: 1.25 }}>
                  <Box sx={{ flexShrink: 0, mt: 0.25 }}>
                    <BotAvatar size={28} />
                  </Box>
                  <Box sx={{ maxWidth: '78%', minWidth: 0 }}>
                    <Box
                      sx={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px 14px 14px 14px',
                        px: 1.25,
                        py: 0.9,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      <Typography sx={{ fontSize: 13, color: '#1e293b', lineHeight: 1.45 }}>
                        {m.text}
                      </Typography>
                    </Box>
                    {/* Deep links into the app the bot suggests with this
                        reply — "Open page" chips next to the answer. */}
                    {m.links && m.links.length > 0 && (
                      <Stack
                        direction='row'
                        spacing={0.5}
                        sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.5 }}
                      >
                        {m.links.map((l) => (
                          <Stack
                            key={l.path}
                            direction='row'
                            spacing={0.5}
                            alignItems='center'
                            onClick={() => {
                              navigateToPath(l.path);
                            }}
                            sx={{
                              cursor: 'pointer',
                              border: '1px solid #c4b5fd',
                              borderRadius: 999,
                              px: 1.25,
                              py: 0.4,
                              backgroundColor: '#f5f3ff',
                              transition: 'background-color 0.15s',
                              '&:hover': { backgroundColor: '#ede9fe' },
                            }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 13, color: '#6d28d9' }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6d28d9' }}>
                              {l.label}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              ) : (
                <Stack
                  key={m.id}
                  direction='row'
                  spacing={1}
                  justifyContent='flex-end'
                  sx={{ mb: 1.25 }}
                >
                  <Box
                    sx={{
                      backgroundColor: '#eef2ff',
                      border: '1px solid #e0e7ff',
                      borderRadius: '14px 4px 14px 14px',
                      px: 1.25,
                      py: 0.9,
                      maxWidth: '78%',
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: '#1e293b', lineHeight: 1.45 }}>
                      {m.text}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: '#1e2a5e',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    {userInitials}
                  </Avatar>
                </Stack>
              ),
            )}

            {typing && (
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1.25 }}>
                <BotAvatar size={28} />
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px 14px 14px 14px',
                    px: 1.5,
                    py: 1,
                    display: 'flex',
                    gap: 0.75,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      className='airaDot'
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#c4b5fd',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </Box>
              </Stack>
            )}
          </Box>

          {/* Input row: paperclip + text field + send */}
          <Stack
            direction='row'
            alignItems='center'
            spacing={0.75}
            sx={{ p: 1.25, backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}
          >
            <Tooltip title='Attach file' placement='top'>
              <IconButton size='small' sx={{ color: '#6d28d9' }}>
                <AttachFileIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Box
              component='label'
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                px: 1.5,
                '&:focus-within': {
                  borderColor: '#8b5cf6',
                  boxShadow: '0 0 0 2px rgba(139,92,246,0.2)',
                },
              }}
            >
              <input
                className='airaChatInput'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder='Type a message...'
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '8px 0',
                  fontSize: 13,
                  color: '#1e293b',
                  background: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
            <Tooltip title='Send' placement='top'>
              <IconButton
                size='small'
                disabled={!input.trim()}
                onClick={() => send(input)}
                sx={{
                  width: 36,
                  height: 36,
                  p: 0,
                  bgcolor: '#312e81',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3730a3' },
                  '&:disabled': { bgcolor: '#cbd5e1', color: '#fff' },
                }}
              >
                <SendIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* Bot-avatar + typing-dot keyframes and input placeholder colour
          (injected once; native CSS so MUI `sx` never carries a raw
          `animation` shorthand that TS can't type-check). */}
      <Box component='style'>
        {`
          /* Typing indicator dots */
          @keyframes airaDot {
            0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-3px); }
          }
          .airaDot { animation: airaDot 1s infinite; }

          /* Big floating button: gentle vertical bob */
          @keyframes airaBotFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          .airaBotAvatarFloat { animation: airaBotFloat 3s ease-in-out infinite; }

          /* Robot face: eyes blink on a loop (scale-Y squash) */
          @keyframes airaBlink {
            0%, 92%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.1); }
          }
          .airaBotEye {
            transform-origin: 50% 50%;
            transform-box: fill-box;
            animation: airaBlink 4.5s ease-in-out infinite;
          }

          /* Antenna light: soft amber pulse */
          @keyframes airaPulse {
            0%, 100% { opacity: 0.45; }
            50% { opacity: 1; }
          }
          .airaBotLight { animation: airaPulse 2s ease-in-out infinite; }

          /* Chat input placeholder */
          .airaChatInput::placeholder { color: #94a3b8; }
        `}
      </Box>
    </>
  );
};

export default HrChatbot;
