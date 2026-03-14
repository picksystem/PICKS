import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Box from '../Box';

describe('Box', () => {
  it('renders correctly', () => {
    const { container } = render(<Box />);
    expect(container).toBeInTheDocument();
  });
});
