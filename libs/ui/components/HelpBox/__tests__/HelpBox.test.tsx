import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import HelpBox from '../HelpBox';

describe('HelpBox', () => {
  it('renders correctly', () => {
    const { container } = render(<HelpBox message='Help' />);
    expect(container).toBeInTheDocument();
  });
});
