import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import UploadFile from '../UploadFile';

describe('UploadFile', () => {
  it('renders correctly', () => {
    const { container } = render(
      <UploadFile
        onChange={() => {
          /* empty */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
