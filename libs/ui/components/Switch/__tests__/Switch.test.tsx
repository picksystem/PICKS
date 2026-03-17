import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Switch from '../Switch';

describe('Switch', () => {
  it('renders correctly', () => {
    const { container } = render(<Switch />);
    expect(container).toBeInTheDocument();
  });
});
