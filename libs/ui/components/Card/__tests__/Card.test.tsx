import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Card from '../Card';

describe('Card', () => {
  it('renders correctly', () => {
    const { container } = render(<Card />);
    expect(container).toBeInTheDocument();
  });
});
