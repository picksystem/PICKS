import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import GridItem from '../GridItem';

describe('GridItem', () => {
  it('renders correctly', () => {
    const { container } = render(<GridItem />);
    expect(container).toBeInTheDocument();
  });
});
