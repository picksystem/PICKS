import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Tooltip title='Tooltip'>
        <div>Content</div>
      </Tooltip>,
    );
    expect(container).toBeInTheDocument();
  });
});
