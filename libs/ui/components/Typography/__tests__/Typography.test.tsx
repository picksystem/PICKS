import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Typography from '../Typography';

describe('Typography', () => {
  it('renders correctly', () => {
    const { container } = render(<Typography text='Text' />);
    expect(container).toBeInTheDocument();
  });
});
