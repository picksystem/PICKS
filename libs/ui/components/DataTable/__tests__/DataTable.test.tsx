import { render, screen, fireEvent, within } from '../../../test-utils';
import '@testing-library/jest-dom';
import { DataTable, Column } from '../DataTable';

interface TestData {
  id: number;
  name: string;
  email: string;
  age: number;
  status: string;
}

const mockColumns: Column<TestData>[] = [
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email' },
  { id: 'age', label: 'Age', align: 'right', sortable: true },
  { id: 'status', label: 'Status' },
];

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, status: 'Active' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', age: 28, status: 'Active' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', age: 32, status: 'Inactive' },
];

describe('DataTable Component', () => {
  it('renders table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders all column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays table title when provided', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' title='User List' />);

    expect(screen.getByText('User List')).toBeInTheDocument();
  });

  it('shows pagination controls', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' />);

    expect(screen.getByLabelText(/rows per page/i)).toBeInTheDocument();
  });

  it('changes page when pagination controls are used', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' initialRowsPerPage={2} />);

    // Only first 2 items should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();

    // Go to next page
    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    // Now Bob Johnson should be visible
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters data when search is used', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' searchable />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('sorts data when column header is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    // After first click, should be sorted ascending
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // Skip header row
    expect(within(firstDataRow).getByText('Alice Williams')).toBeInTheDocument();
  });

  it('displays checkboxes when selectable is true', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' selectable />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('selects row when checkbox is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' selectable />);

    const checkboxes = screen.getAllByRole('checkbox');
    const firstRowCheckbox = checkboxes[1]; // Skip select all checkbox

    fireEvent.click(firstRowCheckbox);

    expect(firstRowCheckbox).toBeChecked();
  });

  it('selects all rows when select all checkbox is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' selectable />);

    const checkboxes = screen.getAllByRole('checkbox');
    const selectAllCheckbox = checkboxes[0];

    fireEvent.click(selectAllCheckbox);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('calls onRowClick when row is clicked', () => {
    const onRowClick = jest.fn();
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' onRowClick={onRowClick} />);

    const row = screen.getByText('John Doe').closest('tr');
    if (row) {
      fireEvent.click(row);
    }

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('displays delete button when rows are selected and onDelete is provided', () => {
    const onDelete = jest.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        rowKey='id'
        selectable
        onDelete={onDelete}
      />,
    );

    // Select a row
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    // Delete button should appear
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onDelete with selected rows', () => {
    const onDelete = jest.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        rowKey='id'
        selectable
        onDelete={onDelete}
      />,
    );

    // Select first two rows
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith([mockData[0], mockData[1]]);
  });

  it('displays "No data available" when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} rowKey='id' />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('uses custom format function for column', () => {
    const columnsWithFormat: Column<TestData>[] = [
      {
        id: 'name',
        label: 'Name',
        format: (value) => <strong>{value as string}</strong>,
      },
      { id: 'email', label: 'Email' },
    ];

    render(<DataTable columns={columnsWithFormat} data={mockData} rowKey='id' />);

    const nameCell = screen.getByText('John Doe');
    expect(nameCell.tagName).toBe('STRONG');
  });

  it('hides search field when searchable is false', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' searchable={false} />);

    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('changes rows per page', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' />);

    const rowsPerPageSelect = screen.getByLabelText(/rows per page/i);
    fireEvent.mouseDown(rowsPerPageSelect);

    const option25 = screen.getByRole('option', { name: '25' });
    fireEvent.click(option25);

    // All 5 items should now be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Alice Williams')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('shows selected count when rows are selected', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowKey='id' selectable />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });
});
