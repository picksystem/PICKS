import React from 'react';
import { Box, Paper, Button, Tooltip, TextField } from '@serviceops/component';
import { InputAdornment, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { useStyles } from '../../styles';

interface PanelToolbarProps {
  accent: string;
  selectedLabel: string | null;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  search: string;
  onSearch: (v: string) => void;
  onClear: () => void;
}

export const PanelToolbar = ({
  accent,
  selectedLabel,
  onNew,
  onEdit,
  onDelete,
  search,
  onSearch,
  onClear,
}: PanelToolbarProps) => {
  const { classes } = useStyles();
  return (
    <Paper
      variant='outlined'
      sx={{
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        px: 1.5,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Box className={classes.toolbarButtons}>
        {!selectedLabel ? (
          <Tooltip title='Add new row'>
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={onNew}
            >
              New
            </Button>
          </Tooltip>
        ) : (
          <Button
            size='small'
            variant='contained'
            startIcon={<EditIcon />}
            sx={{ textTransform: 'none', bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
        {selectedLabel && (
          <Button
            size='small'
            variant='outlined'
            color='error'
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        )}
        {selectedLabel && (
          <>
            <Box
              component='span'
              sx={{
                display: { xs: 'none', sm: 'block' },
                width: '1px',
                height: '20px',
                bgcolor: alpha('#2d5ebb', 0.3),
                mx: 0.75,
                alignSelf: 'center',
              }}
            />
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon />}
              onClick={onClear}
              sx={{
                textTransform: 'none',
                borderColor: '#2d5ebb',
                color: '#2d5ebb',
                '&:hover': {
                  borderColor: '#2d5ebb',
                  bgcolor: alpha('#2d5ebb', 0.08),
                },
              }}
            >
              Clear
            </Button>
          </>
        )}
        <TextField
          size='small'
          placeholder='Search…'
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={classes.tableSearchField}
          sx={{ ml: { xs: 0, sm: 'auto' } }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon sx={{ fontSize: '1rem' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Paper>
  );
};
