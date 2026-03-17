import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Drawer from '../Drawer';

describe('Drawer', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Drawer
        open={false}
        onClose={() => {
          /* empty */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
