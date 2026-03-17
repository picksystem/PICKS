import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import AutoGrid from '../AutoGrid';

describe('AutoGrid', () => {
  it('renders correctly', () => {
    const { container } = render(
      <AutoGrid>
        <div>Child</div>
      </AutoGrid>,
    );
    expect(container).toBeInTheDocument();
  });
});
