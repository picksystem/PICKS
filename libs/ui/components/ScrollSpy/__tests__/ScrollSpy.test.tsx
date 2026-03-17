import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import ScrollSpy from '../ScrollSpy';

describe('ScrollSpy', () => {
  it('renders correctly', () => {
    const { container } = render(<ScrollSpy sections={[]} />);
    expect(container).toBeInTheDocument();
  });
});
