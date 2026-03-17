import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { container } = render(<Button label='Click me' />);
    expect(container).toBeInTheDocument();
  });
});
