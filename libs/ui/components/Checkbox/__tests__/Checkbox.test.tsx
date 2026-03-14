import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  it('renders correctly', () => {
    const { container } = render(<Checkbox />);
    expect(container).toBeInTheDocument();
  });
});
