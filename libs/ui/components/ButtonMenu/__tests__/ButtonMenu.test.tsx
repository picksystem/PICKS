import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import ButtonMenu from '../ButtonMenu';

describe('ButtonMenu', () => {
  it('renders correctly', () => {
    const { container } = render(<ButtonMenu buttonLabel='Menu' items={[]} />);
    expect(container).toBeInTheDocument();
  });
});
