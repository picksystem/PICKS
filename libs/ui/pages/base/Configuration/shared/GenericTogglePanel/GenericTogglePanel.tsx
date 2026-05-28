import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Paper, Switch, TextField, alpha, InputAdornment } from '@mui/material';
import { DataTable, Column } from '@serviceops/component';
import {
  PanelHeader,
  TableConfig,
} from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import SearchIcon from '@mui/icons-material/Search';
import type { IConfigServiceLineTicketType } from '@serviceops/interfaces';

interface ToggleRow {
  ticketTypeKey: string;
  ticketTypeId: string | number;
  enabled: boolean;
}

interface GenericTogglePanelProps {
  config: TableConfig;
  allTicketTypeKeys: string[];
  selectedParentId: string | null;
  ticketTypeActivations: IConfigServiceLineTicketType[] | Record<string, boolean>;
  onToggle: (ticketTypeKey: string, enabled: boolean, ticketTypeId: string | number) => void;
}

export const GenericTogglePanel = ({
  config,
  allTicketTypeKeys,
  ticketTypeActivations,
  onToggle,
}: GenericTogglePanelProps) => {
  const [search, setSearch] = useState('');

  // Local state for toggle values to track changes before saving
  const [localToggles, setLocalToggles] = useState<Record<string, boolean>>({});

  // Initialize local state from ticketTypeActivations
  useEffect(() => {
    if (Array.isArray(ticketTypeActivations)) {
      const map = ticketTypeActivations.reduce(
        (acc, item) => {
          acc[item.ticketTypeName] = item.enabled;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setLocalToggles(map);
    }
  }, [ticketTypeActivations]);

  const activationMap = useMemo(() => {
    if (Array.isArray(ticketTypeActivations)) {
      return ticketTypeActivations.reduce(
        (acc, item) => {
          acc[item.ticketTypeName] = item.enabled;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    }
    return ticketTypeActivations;
  }, [ticketTypeActivations]);

  // Build rows from allTicketTypeKeys with both id and name
  const allRows: ToggleRow[] = useMemo(() => {
    if (Array.isArray(ticketTypeActivations)) {
      return allTicketTypeKeys.map((key) => {
        const stored = ticketTypeActivations.find((ta) => ta.ticketTypeName === key);
        return {
          ticketTypeKey: key,
          ticketTypeId: stored?.ticketTypeId || '',
          enabled: localToggles[key] ?? stored?.enabled ?? true,
        };
      });
    }
    return allTicketTypeKeys.map((key) => ({
      ticketTypeKey: key,
      ticketTypeId: '',
      enabled: localToggles[key] ?? activationMap[key] ?? false,
    }));
  }, [allTicketTypeKeys, ticketTypeActivations, activationMap, localToggles]);

  // Filter rows based on search
  const filtered = useMemo(() => {
    if (!search) return allRows;
    return allRows.filter((row) => row.ticketTypeKey.toLowerCase().includes(search.toLowerCase()));
  }, [search, allRows]);

  const handleToggle = (key: string, checked: boolean, ticketTypeId: string | number) => {
    // Update local state immediately for responsive UI
    setLocalToggles((prev) => ({ ...prev, [key]: checked }));
    // Call parent handler to persist
    onToggle(key, checked, ticketTypeId);
  };

  const columns: Column<ToggleRow>[] = useMemo(
    () => [
      {
        id: 'ticketTypeKey',
        label: 'Ticket Type',
        minWidth: 200,
        format: (v: unknown) => (
          <Typography variant='body2' sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {String(v)}
          </Typography>
        ),
      },
      {
        id: 'enabled',
        label: 'Enabled',
        minWidth: 120,
        format: (v: unknown, row: ToggleRow) => (
          <Switch
            size='small'
            checked={Boolean(localToggles[row.ticketTypeKey] ?? row.enabled)}
            onChange={(e) => handleToggle(row.ticketTypeKey, e.target.checked, row.ticketTypeId)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: config.accent,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                bgcolor: config.accent,
              },
            }}
          />
        ),
      },
    ],
    [config.accent, localToggles],
  );

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader icon={config.icon} title={config.title} accent={config.accent} />

      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(config.accent, 0.25),
          borderTop: 'none',
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            size='small'
            placeholder='Search...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flexShrink: 0,
              width: '160px',
              '& .MuiOutlinedInput-root': {
                height: '30px',
                fontSize: '0.8rem',
                backgroundColor: '#fff',
                borderRadius: '6px',
                boxSizing: 'border-box',
              },
              '& .MuiInputBase-input': {
                fontSize: '0.8rem',
                boxSizing: 'border-box',
              },
              '& .MuiInputBase-input::placeholder': {
                opacity: 0.7,
              },
              '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                fontSize: '1.1rem',
                color: '#7f7f7f',
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon fontSize='small' />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <DataTable<ToggleRow>
          columns={columns}
          data={filtered}
          rowKey='ticketTypeKey'
          searchable={false}
          initialRowsPerPage={10}
        />
      </Paper>
    </Box>
  );
};
