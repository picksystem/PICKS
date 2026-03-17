import { Box, Typography, Table } from '@picks/component';
import { useStyles } from './styles';
import { useMetadata } from './metadata';

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'Editor' },
];

const columns = [
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { id: 'role', label: 'Role', minWidth: 100 },
];

const Favourites = () => {
  const { classes } = useStyles();
  const { title, description } = useMetadata();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Favourites - Users
      </Typography>
      <Typography variant='h4' className={classes.title}>
        {title}
      </Typography>
      <Typography variant='h4' className={classes.title}>
        {description}
      </Typography>
      <Table columns={columns} rows={mockUsers} className={classes.tableContainer as string} />
    </Box>
  );
};

export default Favourites;
