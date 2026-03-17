import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import ReadOnlyField from '../ReadOnlyField';

describe('ReadOnlyField', () => {
  it('renders correctly', () => {
    const { container } = render(<ReadOnlyField label='Label' value='Value' />);
    expect(container).toBeInTheDocument();
  });
});
