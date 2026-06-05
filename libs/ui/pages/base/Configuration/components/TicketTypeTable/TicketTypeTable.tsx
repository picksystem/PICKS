import React from 'react';
import { alpha } from '@mui/material';
import { ITicketType } from '@serviceops/interfaces';
import { Box, Typography, Chip, Tooltip, Switch, DataTable, Column } from '@serviceops/component';
import { loadTagMap, getTagOption } from '../../utils/ticketTypeIcons';
import type { TicketTypeTableProps } from './util';

const FALLBACK_COLOR = '#64748b';

function buildPreview(prefix: string, length: number): string {
  const num = '1'.padStart(Math.max(1, length), '0');
  return `${prefix.toUpperCase()}${num}`;
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
      id: 'name',
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
              {row.name}
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
      id: 'displayName',
      label: 'Creation Page Display Text',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
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
      id: 'formatPreview',
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
      id: 'shortDescription',
      label: 'IT Team Internal Note',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'displayTag',
      label: 'Creation page display tag',
      minWidth: 120,
      format: (v): React.ReactNode => {
        const tag = String(v || '');
        return tag ? (
          <Chip
            label={tag}
            size='small'
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 22,
            }}
          />
        ) : (
          <Typography variant='body2' color='text.secondary' fontSize='0.8rem'>
            —
          </Typography>
        );
      },
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
      activeRowKey={selectedRowId ?? undefined}
    />
  );
};

export default TicketTypeTable;
