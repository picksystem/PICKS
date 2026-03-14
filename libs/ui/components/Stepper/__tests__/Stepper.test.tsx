import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Stepper from '../Stepper';

describe('Stepper', () => {
  it('renders correctly', () => {
    const { container } = render(<Stepper steps={[]} activeStep={0} />);
    expect(container).toBeInTheDocument();
  });
});
