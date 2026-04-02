import { useAppMetadata } from '@serviceops/theme';

export const useMetadata = () =>
  useAppMetadata(
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
