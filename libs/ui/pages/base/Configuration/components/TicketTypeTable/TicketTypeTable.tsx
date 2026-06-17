import React from 'react';
import { alpha } from '@mui/material';
import { ITicketType } from '@serviceops/interfaces';
import { Box, Typography, Chip, Tooltip, Switch, DataTable, Column } from '@serviceops/component';
import { loadTagMap, getTagOption } from '../../utils/ticketTypeIcons';
import type { TicketTypeTableProps } from './util';

const FALLBACK_COLOR = '#64748b';

// Access control chip colors
const ACCESS_ROLES_CONFIG = [
  { value: 'admin', label: 'Admin', color: '#f97316' }, // orange
  { value: 'consultant', label: 'Consultant', color: '#3b82f6' }, // blue
  { value: 'endUser', label: 'End User', color: '#22c55e' }, // green
];

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
      id: 'displayTag',
      label: 'Display Tag',
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
    {
      id: 'displayName',
      label: 'Display Text',
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
      minWidth: 130,
      align: 'center',
      format: (_v, row): React.ReactNode => {
        const on = row.isActive;
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              borderRadius: 999,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.3,
              textTransform: 'uppercase',
              minWidth: 96,
              border: '1px solid',
              borderColor: on ? '#16a34a' : '#cbd5e1',
              bgcolor: on ? '#dcfce7' : '#f1f5f9',
              color: on ? '#15803d' : '#64748b',
            }}
          >
            <Box
              component='span'
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: on ? '#16a34a' : '#94a3b8',
                boxShadow: on ? '0 0 0 3px rgba(22, 163, 74, 0.18)' : 'none',
              }}
            />
            {on ? 'Active' : 'Inactive'}
          </Box>
        );
      },
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
      id: 'accessControl',
      label: 'Access Control',
      minWidth: 200,
      format: (_v, row): React.ReactNode => {
        const { accessControl } = row as unknown as { accessControl?: string[] };
        if (!accessControl || accessControl.length === 0) {
          return (
            <Typography variant='body2' color='text.secondary' fontSize='0.8rem'>
              —
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {accessControl.map((role: string) => {
              const roleConfig = ACCESS_ROLES_CONFIG.find((r) => r.value === role);
              if (!roleConfig) return null;
              return (
                <Chip
                  key={role}
                  label={roleConfig.label}
                  size='small'
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    bgcolor: alpha(roleConfig.color, 0.15),
                    color: roleConfig.color,
                    border: `1px solid ${alpha(roleConfig.color, 0.4)}`,
                  }}
                />
              );
            })}
          </Box>
        );
      },
    },
    {
      id: 'shortDescription',
      label: 'Internal Note',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem'>
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
      activeRowKey={selectedRowId ?? undefined}
    />
  );
};

export default TicketTypeTable;
