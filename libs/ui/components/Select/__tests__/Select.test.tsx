import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Select from '../Select';

describe('Select', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Select
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
