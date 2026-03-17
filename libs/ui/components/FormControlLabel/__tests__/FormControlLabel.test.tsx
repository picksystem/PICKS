import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import FormControlLabel from '../FormControlLabel';

describe('FormControlLabel', () => {
  it('renders correctly', () => {
    const { container } = render(
      <FormControlLabel label='Label' control={<input type='checkbox' />} />,
    );
    expect(container).toBeInTheDocument();
  });
});
