import { useEffect, useState } from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import NumbersIcon from '@mui/icons-material/Numbers';
import { useStyles } from '../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import {
  BusinessCategoriesSection,
  ServiceLinesSection,
  ApplicationsSection,
  ApplicationQueuesSection,
  ApplicationCategoriesSection,
  ApplicationSubCategoriesSection,
  ApplicationNumberSequencesSection,
} from '.';
import {
  CategorizationSectionProps,
  CategorizationActiveView,
} from './CategorizationSection.types';
import {
  IConfigBusinessCategory,
  IConfigServiceLine,
  IConfigApplication,
  IConfigApplicationQueue,
} from '@serviceops/interfaces';

const ACCENT = '#0369a1';

const VIEW_CONFIG: Record<CategorizationActiveView, { title: string; icon: React.ReactNode }> = {
  businessCategory: {
    title: 'Business Categories',
    icon: <AccountTreeIcon sx={{ fontSize: '1rem' }} />,
  },
  serviceLine: { title: 'Service Lines', icon: <LayersIcon sx={{ fontSize: '1rem' }} /> },
  application: { title: 'Applications', icon: <AppShortcutIcon sx={{ fontSize: '1rem' }} /> },
  applicationQueue: {
    title: 'Application Queues',
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} />,
  },
  applicationCategory: {
    title: 'Application Categories',
    icon: <FolderSpecialIcon sx={{ fontSize: '1rem' }} />,
  },
  applicationSubCategory: {
    title: 'Application Sub-Categories',
    icon: <SubdirectoryArrowRightIcon sx={{ fontSize: '1rem' }} />,
  },
  applicationNumberSequence: {
    title: 'Number Sequences',
    icon: <NumbersIcon sx={{ fontSize: '1rem' }} />,
  },
};

const CategorizationSection = ({
  businessCategories: externalBusinessCategories,
  serviceLines: externalServiceLines,
  applications: externalApplications,
  queues: externalQueues,
  onDataChange,
}: CategorizationSectionProps) => {
  const { classes } = useStyles();
  const { categorization: api, saveSection } = useConfiguration();

  const [activeView, setActiveView] = useState<CategorizationActiveView>('businessCategory');

  // Listen for tab-switch events from the sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('[CategorizationSection] ← config:switch-tab event received:', detail);
      if (detail?.tab) {
        setActiveView(detail.tab);
      }
    };
    window.addEventListener('config:switch-tab', handler as EventListener);
    return () =>
      window.removeEventListener('config:switch-tab', handler as EventListener);
  }, []);
  const [businessCategories, setBusinessCategories] = useState<IConfigBusinessCategory[]>([]);
  const [serviceLines, setServiceLines] = useState<IConfigServiceLine[]>([]);
  const [applications, setApplications] = useState<IConfigApplication[]>([]);
  const [queues, setQueues] = useState<IConfigApplicationQueue[]>([]);

  useEffect(() => {
    if (externalBusinessCategories !== undefined) {
      setBusinessCategories(externalBusinessCategories);
    } else if (api?.businessCategories) {
      setBusinessCategories(api.businessCategories);
    }
  }, [externalBusinessCategories, api]);

  useEffect(() => {
    if (externalServiceLines !== undefined) {
      setServiceLines(externalServiceLines);
    } else if (api?.serviceLines) {
      setServiceLines(api.serviceLines);
    }
  }, [externalServiceLines, api]);

  useEffect(() => {
    if (externalApplications !== undefined) {
      setApplications(externalApplications);
    } else if (api?.applications) {
      setApplications(api.applications);
    }
  }, [externalApplications, api]);

  useEffect(() => {
    if (externalQueues !== undefined) {
      setQueues(externalQueues);
    } else if (api?.queues) {
      setQueues(api.queues);
    }
  }, [externalQueues, api]);

  const saveAll = (key: string, value: unknown) => {
    if (onDataChange) {
      onDataChange(key, value);
    } else {
      saveSection('categorization', {
        businessCategories,
        serviceLines,
        applications,
        queues,
        applicationCategories: api?.applicationCategories ?? [],
        applicationSubCategories: api?.applicationSubCategories ?? [],
        applicationNumberSequences: api?.applicationNumberSequences ?? [],
        [key]: value,
      });
    }
  };

  const views: CategorizationActiveView[] = [
    'businessCategory',
    'serviceLine',
    'application',
    'applicationQueue',
    'applicationCategory',
    'applicationSubCategory',
    'applicationNumberSequence',
  ];

  return (
    <GenericAccordion
      id='categorization'
      title='Categorization'
      subtitle='Manage business categories, service lines, applications, and queues'
      icon={<AccountTreeIcon sx={{ fontSize: '1rem', color: ACCENT }} />}
      accent={ACCENT}
      className={classes.sectionAccordion}
    >
      <GenericToolbar
        buttons={views.map((key) => ({
          key,
          label: VIEW_CONFIG[key].title,
          icon: VIEW_CONFIG[key].icon,
          isActive: activeView === key,
          onClick: () => setActiveView(key),
        }))}
      />

      {activeView === 'businessCategory' && (
        <div id='business-categories'>
          <BusinessCategoriesSection
            data={businessCategories}
            onDataChange={(next) => {
              setBusinessCategories(next);
              saveAll('businessCategories', next);
            }}
          />
        </div>
      )}
      {activeView === 'serviceLine' && (
        <div id='service-lines'>
          <ServiceLinesSection
            data={serviceLines}
            businessCategories={businessCategories}
            onDataChange={(next) => {
              setServiceLines(next);
              saveAll('serviceLines', next);
            }}
          />
        </div>
      )}
      {activeView === 'application' && (
        <div id='applications'>
          <ApplicationsSection
            data={applications}
            serviceLines={serviceLines}
            onDataChange={(next) => {
              setApplications(next);
              saveAll('applications', next);
            }}
          />
        </div>
      )}
      {activeView === 'applicationQueue' && (
        <div id='application-queues'>
          <ApplicationQueuesSection
            data={queues}
            onDataChange={(next) => {
              setQueues(next);
              saveAll('queues', next);
            }}
          />
        </div>
      )}
      {activeView === 'applicationCategory' && (
        <div id='application-categories'>
          <ApplicationCategoriesSection
            data={api?.applicationCategories ?? []}
            onDataChange={(next) => saveAll('applicationCategories', next)}
          />
        </div>
      )}
      {activeView === 'applicationSubCategory' && (
        <div id='application-sub-categories'>
          <ApplicationSubCategoriesSection
            data={api?.applicationSubCategories ?? []}
            onDataChange={(next) => saveAll('applicationSubCategories', next)}
          />
        </div>
      )}
      {activeView === 'applicationNumberSequence' && (
        <div id='application-number-sequences'>
          <ApplicationNumberSequencesSection
            data={api?.applicationNumberSequences ?? []}
            onDataChange={(next) => saveAll('applicationNumberSequences', next)}
          />
        </div>
      )}
    </GenericAccordion>
  );
};

export { CategorizationSection };
