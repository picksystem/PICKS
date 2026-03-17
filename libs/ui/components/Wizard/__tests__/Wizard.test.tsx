import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Wizard from '../Wizard';

describe('Wizard', () => {
  it('renders correctly', () => {
    const steps = [{ title: 'Step 1', content: <div>Content</div> }];
    const { container } = render(
      <Wizard
        steps={steps}
        onComplete={() => {
          /* empty */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
