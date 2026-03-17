import { createAppMetadata } from '@picks/theme';

export const useMetadata = () =>
  createAppMetadata(
    {
      title: 'Welcome to Generale Partner Favourites Page',
      description:
        'This is the Generale Partner Favourites Page. You can manage your account here.',
    },
    {
      user: {
        title: 'Welcome to User Generale Partner Favourites Page',
        description:
          'This is the User Generale Partner Favourites Page. You can manage your account here.',
      },
    },
  );
