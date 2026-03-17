import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Modal
        open={false}
        onClose={() => {
          /* empty */
        }}
      >
        <div>Content</div>
      </Modal>,
    );
    expect(container).toBeInTheDocument();
  });
});
