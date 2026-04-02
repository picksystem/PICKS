import React from 'react';
import { Box, Typography, Chip, Tooltip, alpha, Switch } from '@mui/material';
import { ITicketType } from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { loadTagMap, getTagOption } from '../utils/ticketTypeIcons';

const FALLBACK_COLOR = '#64748b';

function buildPreview(prefix: string, length: number): string {
  const num = '1'.padStart(Math.max(1, length), '0');
  return `${prefix.toUpperCase()}${num}`;
}

interface TicketTypeTableProps {
  ticketTypes: ITicketType[];
  selectedRowId?: number;
  onRowClick?: (row: ITicketType) => void;
  onToggleActive?: (row: ITicketType) => void;
}

const TicketTypeTable = ({
  ticketTypes,
  selectedRowId,
  onRowClick,
  onToggleActive,
}: TicketTypeTableProps) => {
  const tagMap = loadTagMap();

  const getAccentColor = (type: string): string => {
    const tag = tagMap[type] ?? '';
    return getTagOption(tag)?.color ?? FALLBACK_COLOR;
  };

  const columns: Column<ITicketType>[] = [
    {
      id: 'type',
      label: 'Ticket Type',
      minWidth: 140,
      format: (_v, row): React.ReactNode => {
        const accentColor = getAccentColor(row.type);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: accentColor,
                flexShrink: 0,
              }}
            />
            <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
              {row.displayName || row.name}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'Activation',
      minWidth: 100,
      align: 'left',
      format: (_v, row): React.ReactNode => (
        <Switch
          checked={row.isActive}
          onChange={(e) => {
            e.stopPropagation();
            onToggleActive?.(row);
          }}
          onClick={(e) => e.stopPropagation()}
          size='small'
          color='success'
        />
      ),
    },
    {
      id: 'prefix',
      label: 'Prefix',
      minWidth: 90,
      format: (_v, row): React.ReactNode => {
        const accentColor = getAccentColor(row.type);
        const prefix = row.prefix || row.type.slice(0, 3).toUpperCase();
        return (
          <Chip
            label={prefix}
            size='small'
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.78rem',
              bgcolor: alpha(accentColor, 0.12),
              color: accentColor,
              border: `1px solid ${alpha(accentColor, 0.25)}`,
              height: 24,
            }}
          />
        );
      },
    },
    {
      id: 'numberLength',
      label: 'Number Length',
      minWidth: 110,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontSize='0.82rem'>
          {String(v || 7)} digits
        </Typography>
      ),
    },
    {
      id: 'prefix' as keyof ITicketType,
      label: 'Format Preview',
      minWidth: 140,
      format: (_v, row): React.ReactNode => {
        const accentColor = getAccentColor(row.type);
        const prefix = row.prefix || row.type.slice(0, 3).toUpperCase();
        const preview = buildPreview(prefix, row.numberLength || 7);
        return (
          <Tooltip title='How ticket numbers will look' placement='top'>
            <Typography
              variant='body2'
              fontFamily='monospace'
              fontWeight={600}
              fontSize='0.82rem'
              sx={{ color: accentColor }}
            >
              {preview}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      id: 'displayName',
      label: 'Display Name',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={ticketTypes}
      rowKey='id'
      searchable={false}
      initialRowsPerPage={10}
      onRowClick={onRowClick}
      activeRowKey={selectedRowId}
    />
  );
};

export default TicketTypeTable;
