import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import ImageBackground from '../ImageBackground';

describe('ImageBackground', () => {
  it('renders correctly', () => {
    const { container } = render(
      <ImageBackground src='test.jpg'>
        <div>Test</div>
      </ImageBackground>,
    );
    expect(container).toBeInTheDocument();
  });
});
