import React from 'react';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import AppsIcon from '@mui/icons-material/Apps';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PersonIcon from '@mui/icons-material/Person';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export type ActiveExpenseView =
  | 'project'
  | 'category'
  | 'categorySubCategory'
  | 'serviceLine'
  | 'application'
  | 'queue'
  | 'resource';

export const VIEW_CONFIG: Record<ActiveExpenseView, { title: string; icon: React.ReactNode }> = {
  project: { title: 'Expense Projects', icon: <AccountTreeIcon sx={{ fontSize: '1rem' }} /> },
  category: { title: 'Expense Categories', icon: <CategoryIcon sx={{ fontSize: '1rem' }} /> },
  categorySubCategory: {
    title: 'Sub-Categories',
    icon: <AccountTreeIcon sx={{ fontSize: '1rem' }} />,
  },
  serviceLine: { title: 'Add to Service Line', icon: <LayersIcon sx={{ fontSize: '1rem' }} /> },
  application: { title: 'Add to Application', icon: <AppsIcon sx={{ fontSize: '1rem' }} /> },
  queue: { title: 'Add to Queue', icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} /> },
  resource: { title: 'Add to Resource', icon: <PersonIcon sx={{ fontSize: '1rem' }} /> },
};

export const views: ActiveExpenseView[] = [
  'project',
  'category',
  'categorySubCategory',
  'serviceLine',
  'application',
  'queue',
  'resource',
];
