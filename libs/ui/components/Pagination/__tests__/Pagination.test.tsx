import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Pagination
        count={10}
        page={1}
        onChange={() => {
          /* empty */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
