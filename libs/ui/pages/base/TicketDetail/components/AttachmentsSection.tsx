import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import {
  CloudUploadOutlined as CloudUploadIcon,
  DeleteOutline as DeleteOutlineIcon,
  DownloadOutlined as DownloadIcon,
} from '@mui/icons-material';
import { useNotification } from '@serviceops/hooks';
import { useUploadTicketAttachmentsMutation } from '@serviceops/services';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';

interface AttachmentsSectionProps {
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onRefresh: () => void;
}

interface AttachmentItemProps {
  filename: string;
  onDownload: (filename: string) => void;
  onDelete: (filename: string) => void;
}

const AttachmentItem = ({ filename, onDownload, onDelete }: AttachmentItemProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      padding: '14px 16px',
      borderRadius: '10px',
      border: '1px solid rgba(226, 232, 255, 0.9)',
      background: '#ffffff',
      transition: 'all 0.15s ease',
      '&:hover': {
        background: '#f8faff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      },
    }}
  >
    {/* Cloud upload icon */}
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: '8px',
        background: '#eef2ff',
        border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 20, color: '#6366f1' }} />
    </Box>

    {/* Filename */}
    <Typography
      sx={{
        flex: 1,
        fontSize: '0.88rem',
        fontWeight: 700,
        color: '#1e293b',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={filename}
    >
      {filename}
    </Typography>

    {/* Actions: download + delete */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
      <Tooltip title='Download' arrow placement='top'>
        <IconButton
          size='small'
          onClick={() => onDownload(filename)}
          sx={{
            width: 34,
            height: 34,
            color: '#6366f1',
            '&:hover': { background: '#eef2ff', borderRadius: '8px' },
          }}
        >
          <DownloadIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title='Delete' arrow placement='top'>
        <IconButton
          size='small'
          onClick={() => onDelete(filename)}
          sx={{
            width: 34,
            height: 34,
            color: '#dc2626',
            '&:hover': { background: '#fef2f2', borderRadius: '8px' },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

const AttachmentsSection = ({ incident, onUpdateTicket, onRefresh }: AttachmentsSectionProps) => {
  const notify = useNotification();

  const existingAttachments: string[] = (() => {
    try {
      return incident.attachments ? JSON.parse(incident.attachments) : [];
    } catch {
      return [];
    }
  })();

  const [uploadAttachments] = useUploadTicketAttachmentsMutation();

  const handleDownload = async (filename: string) => {
    const fileUrl = `http://localhost:3001/uploads/attachments/${encodeURIComponent(filename)}`;
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) {
        notify.error(`File "${filename}" is not available on the server.`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      notify.error(`Failed to download "${filename}". Please try again.`);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const updated = existingAttachments.filter((f) => f !== filename);
      await onUpdateTicket({
        id: incident.id,
        data: { attachments: JSON.stringify(updated) },
      }).unwrap();
      onRefresh();
      notify.success('Attachment removed');
    } catch {
      notify.error('Failed to remove attachment');
    }
  };

  const hasAttachments = existingAttachments.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {hasAttachments ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {existingAttachments.map((att, idx) => {
            const displayName = att.replace(/^\d{10,}-/, '');
            return (
              <AttachmentItem
                key={`${att}-${idx}`}
                filename={displayName}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 5,
            px: 2,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
            border: '1px dashed rgba(139,92,246,0.25)',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
          <Typography
            sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#6d28d9', textAlign: 'center' }}
          >
            No attachments yet
          </Typography>
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#a78bfa',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: 260,
              lineHeight: 1.5,
            }}
          >
            Use the Attachment button in the toolbar to upload files
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AttachmentsSection;
