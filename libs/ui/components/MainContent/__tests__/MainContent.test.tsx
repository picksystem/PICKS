import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import MainContent from '../MainContent';

describe('MainContent', () => {
  it('renders correctly', () => {
    const { container } = render(
      <MainContent>
        <div>Content</div>
      </MainContent>,
    );
    expect(container).toBeInTheDocument();
  });
});
