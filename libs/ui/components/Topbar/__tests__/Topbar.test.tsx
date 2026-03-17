import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Topbar from '../Topbar';

describe('Topbar', () => {
  it('renders correctly', () => {
    const { container } = render(<Topbar />);
    expect(container).toBeInTheDocument();
  });
});
