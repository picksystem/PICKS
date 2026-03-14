import { createAppMetadata } from '../../../../../theme';

export const useMetadata = () =>
  createAppMetadata(
    {
      title: 'Welcome to Generale Partner Favourites Page',
      description:
        'This is the Generale Partner Favourites Page. You can manage your account here.',
    },
    {
      admin: {
        title: 'Welcome to Admin Generale Partner Favourites Page',
        description:
          'This is the Admin Generale Partner Favourites Page. You can manage your account here.',
      },
    },
  );
