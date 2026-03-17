import type { Meta, StoryFn } from '@storybook/react';
import { DataTable, Column, DataTableProps } from '../DataTable';
import { Chip, Avatar, IconButton } from '@mui/material';
import { Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';

const meta: Meta = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// Sample data interfaces
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

// Sample user data
const userData: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    joinedDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    joinedDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    status: 'inactive',
    joinedDate: '2023-03-10',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'User',
    status: 'active',
    joinedDate: '2023-04-05',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'User',
    status: 'pending',
    joinedDate: '2023-05-12',
  },
  {
    id: 6,
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Admin',
    status: 'active',
    joinedDate: '2023-06-18',
  },
  {
    id: 7,
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    role: 'Manager',
    status: 'active',
    joinedDate: '2023-07-22',
  },
  {
    id: 8,
    name: 'Fiona Green',
    email: 'fiona@example.com',
    role: 'User',
    status: 'inactive',
    joinedDate: '2023-08-30',
  },
];

// Sample product data
const productData: Product[] = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 45, rating: 4.5 },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29.99, stock: 120, rating: 4.2 },
  {
    id: 3,
    name: 'Mechanical Keyboard',
    category: 'Accessories',
    price: 89.99,
    stock: 78,
    rating: 4.7,
  },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 349.99, stock: 32, rating: 4.4 },
  { id: 5, name: 'Webcam HD', category: 'Electronics', price: 79.99, stock: 0, rating: 4.1 },
  { id: 6, name: 'Desk Lamp', category: 'Furniture', price: 45.99, stock: 65, rating: 4.3 },
  { id: 7, name: 'Office Chair', category: 'Furniture', price: 299.99, stock: 18, rating: 4.6 },
  { id: 8, name: 'USB-C Hub', category: 'Accessories', price: 49.99, stock: 95, rating: 4.0 },
  { id: 9, name: 'Headphones', category: 'Electronics', price: 199.99, stock: 55, rating: 4.8 },
  { id: 10, name: 'Backpack', category: 'Accessories', price: 59.99, stock: 42, rating: 4.5 },
];

// User columns with formatting
const userColumns: Column<User>[] = [
  { id: 'id', label: 'ID', minWidth: 50 },
  {
    id: 'name',
    label: 'Name',
    format: (value) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar sx={{ width: 32, height: 32 }}>{(value as string).charAt(0)}</Avatar>
        {value as string}
      </div>
    ),
  },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  {
    id: 'status',
    label: 'Status',
    format: (value) => {
      const status = value as User['status'];
      const colorMap = { active: 'success', inactive: 'error', pending: 'warning' } as const;
      return <Chip label={status} color={colorMap[status]} size='small' />;
    },
  },
  { id: 'joinedDate', label: 'Joined Date' },
];

// Product columns with formatting
const productColumns: Column<Product>[] = [
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Product Name', minWidth: 150 },
  { id: 'category', label: 'Category' },
  {
    id: 'price',
    label: 'Price',
    align: 'right',
    format: (value) => `$${(value as number).toFixed(2)}`,
  },
  {
    id: 'stock',
    label: 'Stock',
    align: 'right',
    format: (value) => {
      const stock = value as number;
      return (
        <Chip
          label={stock === 0 ? 'Out of Stock' : stock}
          color={stock === 0 ? 'error' : stock < 20 ? 'warning' : 'success'}
          size='small'
        />
      );
    },
  },
  {
    id: 'rating',
    label: 'Rating',
    align: 'center',
    format: (value) => `⭐ ${value}`,
  },
];

// Template for User stories
const UserTemplate: StoryFn<DataTableProps<User>> = (args) => <DataTable {...args} />;

// Template for Product stories
const ProductTemplate: StoryFn<DataTableProps<Product>> = (args) => <DataTable {...args} />;

// Basic table
export const Basic = UserTemplate.bind({});
Basic.args = {
  columns: userColumns,
  data: userData,
  rowKey: 'id',
  title: 'Users',
};

// With selection
export const WithSelection = UserTemplate.bind({});
WithSelection.args = {
  columns: userColumns,
  data: userData,
  rowKey: 'id',
  title: 'Select Users',
  selectable: true,
  onDelete: (selectedRows) => {
    console.log('Deleting rows:', selectedRows);
    alert(`Deleting ${selectedRows.length} user(s)`);
  },
};

// With row click handler
export const WithRowClick = UserTemplate.bind({});
WithRowClick.args = {
  columns: userColumns,
  data: userData,
  rowKey: 'id',
  title: 'Click on any row',
  onRowClick: (row) => {
    console.log('Row clicked:', row);
    alert(`Clicked on ${row.name}`);
  },
};

// With search
export const WithSearch = UserTemplate.bind({});
WithSearch.args = {
  columns: userColumns,
  data: userData,
  rowKey: 'id',
  title: 'Searchable Users',
  searchable: true,
};

// Without search
export const WithoutSearch = UserTemplate.bind({});
WithoutSearch.args = {
  columns: userColumns,
  data: userData,
  rowKey: 'id',
  title: 'Users (No Search)',
  searchable: false,
};

// Product table
export const ProductTable = ProductTemplate.bind({});
ProductTable.args = {
  columns: productColumns,
  data: productData,
  rowKey: 'id',
  title: 'Product Inventory',
  searchable: true,
  selectable: true,
};

// Custom pagination
export const CustomPagination = UserTemplate.bind({});
CustomPagination.args = {
  columns: userColumns,
  data: userData,
  rowKey: 'id',
  title: 'Custom Pagination',
  initialRowsPerPage: 3,
};

// Empty state
export const EmptyState = UserTemplate.bind({});
EmptyState.args = {
  columns: userColumns,
  data: [],
  rowKey: 'id',
  title: 'No Users',
};

// With custom actions
export const WithActions: StoryFn<DataTableProps<User>> = () => {
  const columnsWithActions: Column<User>[] = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    {
      id: 'actions',
      label: 'Actions',
      format: (_, row) => (
        <div>
          <IconButton
            size='small'
            color='primary'
            onClick={(e) => {
              e.stopPropagation();
              alert(`Viewing ${row.name}`);
            }}
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size='small'
            color='secondary'
            onClick={(e) => {
              e.stopPropagation();
              alert(`Editing ${row.name}`);
            }}
          >
            <EditIcon />
          </IconButton>
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <DataTable
      columns={columnsWithActions}
      data={userData}
      rowKey='id'
      title='Users with Actions'
    />
  );
};

// Large dataset
export const LargeDataset = ProductTemplate.bind({});
LargeDataset.args = {
  columns: productColumns,
  data: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: ['Electronics', 'Accessories', 'Furniture'][i % 3],
    price: Math.random() * 1000,
    stock: Math.floor(Math.random() * 100),
    rating: 3 + Math.random() * 2,
  })),
  rowKey: 'id',
  title: 'Large Product List (100 items)',
  searchable: true,
  selectable: true,
  initialRowsPerPage: 10,
};

// Minimal (no title, no search, no selection)
export const Minimal = UserTemplate.bind({});
Minimal.args = {
  columns: [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
  ],
  data: userData.slice(0, 5),
  rowKey: 'id',
  searchable: false,
  elevation: 0,
};

// Right aligned columns
export const RightAligned = ProductTemplate.bind({});
RightAligned.args = {
  columns: [
    { id: 'id', label: 'ID', align: 'right' },
    { id: 'name', label: 'Product', align: 'left' },
    {
      id: 'price',
      label: 'Price',
      align: 'right',
      format: (value) => `$${(value as number).toFixed(2)}`,
    },
    { id: 'stock', label: 'Stock', align: 'right' },
  ],
  data: productData.slice(0, 5),
  rowKey: 'id',
  title: 'Right Aligned Columns',
};
