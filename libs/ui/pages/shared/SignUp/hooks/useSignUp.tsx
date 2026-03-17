import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormWithSessionStorage, useNotification } from '@picks/hooks';
import { SignUpSchema } from '@picks/interfaces';
import { constants } from '@picks/utils';
import { useAuthActionMutation } from '@picks/services';

function detectLocaleSettings() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    const locale = navigator.language || 'en-US';
    const langCode = locale.split('-')[0].toLowerCase();

    // Language
    const langMap: Record<string, string> = {
      en: 'en', es: 'es', fr: 'fr', de: 'de', ja: 'ja',
    };
    const language = langMap[langCode] ?? 'en';

    // Date format — detect by seeing which part comes first
    const testDate = new Date(2024, 0, 15);
    const parts = new Intl.DateTimeFormat(locale).formatToParts(testDate);
    const order = parts.filter((p) => ['month', 'day', 'year'].includes(p.type)).map((p) => p.type);
    let dateFormat = 'MM/DD/YYYY';
    if (order[0] === 'day') dateFormat = 'DD/MM/YYYY';
    else if (order[0] === 'year') dateFormat = 'YYYY-MM-DD';

    // Time format — 12h or 24h
    const hourSample = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).format(
      new Date(2024, 0, 1, 13),
    );
    const timeFormat = /am|pm/i.test(hourSample) ? '12h' : '24h';

    // Working calendar & leave calendar by timezone region
    const region = tz.split('/')[0];
    const city = tz.split('/')[1] ?? '';
    let slaWorkingCalendar = 'Standard 8x5';
    let slaExceptionGroup = 'No Holiday Calendar';
    if (region === 'America') {
      slaWorkingCalendar = 'AMER 8x5';
      slaExceptionGroup = 'US Federal Holidays';
    } else if (region === 'Europe') {
      slaWorkingCalendar = 'EMEA 8x5';
      slaExceptionGroup = city === 'London' ? 'UK Bank Holidays' : 'EU Holidays';
    } else if (region === 'Asia' || region === 'Australia' || region === 'Pacific') {
      slaWorkingCalendar = 'APAC 8x5';
      slaExceptionGroup = city === 'Kolkata' ? 'India Public Holidays' : 'APAC Holidays';
    }

    return { timezone: tz, language, dateFormat, timeFormat, slaWorkingCalendar, slaExceptionGroup };
  } catch {
    return {
      timezone: '', language: 'en', dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h', slaWorkingCalendar: 'Standard 8x5', slaExceptionGroup: 'No Holiday Calendar',
    };
  }
}

export const STEPS = [
  { label: 'Personal', fields: ['firstName', 'lastName', 'email', 'phone'] },
  {
    label: 'Work Details',
    fields: [
      'workLocation',
      'department',
      'employeeId',
      'businessUnit',
      'managerName',
      'reasonForAccess',
      'role',
    ],
  },
  { label: 'Security', fields: ['password', 'confirmPassword'] },
];

const useSignUp = () => {
  const navigate = useNavigate();
  const [authAction, { isLoading }] = useAuthActionMutation();
  const notify = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [step2Touched, setStep2Touched] = useState({ password: false, confirmPassword: false });
  const [step2Submitted, setStep2Submitted] = useState(false);
  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem('signUpStep');
      return saved !== null ? Math.min(parseInt(saved, 10), STEPS.length - 1) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('signUpStep', String(step));
    } catch {
      /* ignore */
    }
  }, [step]);

  const locale = detectLocaleSettings();

  const formik = useFormWithSessionStorage('signUp', {
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      workLocation: '',
      department: '',
      reasonForAccess: '',
      employeeId: '',
      businessUnit: '',
      managerName: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      timezone: locale.timezone,
      language: locale.language,
      dateFormat: locale.dateFormat,
      timeFormat: locale.timeFormat,
      slaWorkingCalendar: locale.slaWorkingCalendar,
      slaExceptionGroup: locale.slaExceptionGroup,
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values) => {
      try {
        const result = await authAction({ action: 'signup', ...values }).unwrap();
        const redirectDelay = 2000;
        notify.success(result.message, redirectDelay);
        setSubmitted(true);
        sessionStorage.removeItem('signUpStep');
        setTimeout(() => navigate(constants.Path.SIGNIN, { replace: true }), redirectDelay);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        notify.error(error?.data?.message || error?.message || 'Sign up failed');
      }
    },
  });

  const handleNext = async () => {
    const { fields } = STEPS[step];
    const nextStep = step + 1;
    const touches = fields.reduce<Record<string, boolean>>((acc, f) => ({ ...acc, [f]: true }), {});
    formik.setTouched({ ...formik.touched, ...touches }, false);
    const errors = await formik.validateForm();
    const hasError = fields.some((f) => (errors as Record<string, unknown>)[f]);
    if (!hasError) {
      setStep2Touched({ password: false, confirmPassword: false });
      setStep2Submitted(false);
      setStep(() => nextStep);
    }
  };

  const initials =
    [formik.values.firstName?.[0], formik.values.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || '?';

  return {
    formik,
    isLoading,
    submitted,
    step,
    setStep,
    step2Touched,
    setStep2Touched,
    step2Submitted,
    setStep2Submitted,
    handleNext,
    initials,
    navigate,
  };
};

export default useSignUp;
