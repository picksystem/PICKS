import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import TextField from '../TextField';

describe('TextField', () => {
  it('renders correctly', () => {
    const { container } = render(<TextField />);
    expect(container).toBeInTheDocument();
  });
});
