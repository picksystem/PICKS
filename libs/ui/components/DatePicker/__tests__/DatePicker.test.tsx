import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import DatePicker from '../DatePicker';

describe('DatePicker', () => {
  it('renders correctly', () => {
    const { container } = render(<DatePicker />);
    expect(container).toBeInTheDocument();
  });
});
