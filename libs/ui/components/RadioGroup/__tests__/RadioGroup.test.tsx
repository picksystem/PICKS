import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import RadioGroup from '../RadioGroup';

describe('RadioGroup', () => {
  it('renders correctly', () => {
    const { container } = render(
      <RadioGroup
        options={[]}
        value=''
        onChange={() => {
          /* empty */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
