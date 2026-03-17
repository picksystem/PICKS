import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Link from '../Link';

describe('Link', () => {
  it('renders correctly', () => {
    const { container } = render(<Link href='#'>Link</Link>);
    expect(container).toBeInTheDocument();
  });
});
