import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import ListItems from '../ListItems';

describe('ListItems', () => {
  it('renders correctly', () => {
    const { container } = render(<ListItems items={[]} />);
    expect(container).toBeInTheDocument();
  });
});
