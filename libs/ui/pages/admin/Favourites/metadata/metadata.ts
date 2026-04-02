import { useAppMetadata } from '../../../../../theme';

export const useMetadata = () =>
  useAppMetadata(
    {
      title: 'Welcome to Favourites Page',
      description: 'This is the Favourites Page. You can manage your account here.',
    },
    {
      admin: {
        title: 'Welcome to Admin Favourites Page',
        description: 'This is the Admin Favourites Page. You can manage your account here.',
      },
    },
  );
