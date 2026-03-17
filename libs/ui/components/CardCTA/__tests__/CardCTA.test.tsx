import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import CardCTA from '../CardCTA';

describe('CardCTA', () => {
  it('renders correctly', () => {
    const { container } = render(
      <CardCTA
        title='Title'
        buttonText='Click'
        onButtonClick={() => {
          /* empty */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
