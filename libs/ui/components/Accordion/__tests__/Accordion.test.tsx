import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Accordion from '../Accordion';

describe('Accordion', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Accordion title='Test'>
        <div>Content</div>
      </Accordion>,
    );
    expect(container).toBeInTheDocument();
  });
});
