import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Table from '../Table';

describe('Table', () => {
  it('renders correctly', () => {
    const columns = [{ id: 'name', label: 'Name' }];
    const rows: Array<Record<string, unknown>> = [];
    const { container } = render(<Table columns={columns} rows={rows} />);
    expect(container).toBeInTheDocument();
  });
});
