import { useEffect, useRef } from 'react';
import { FormikConfig, FormikValues } from 'formik';
import { useForm } from './useForm';
import { useSessionStorage } from './useSessionStorage';

/**
 * Wraps useForm with sessionStorage persistence.
 * Form values are saved to sessionStorage on every change and restored on mount.
 * On successful submit or resetForm, sessionStorage is cleared.
 *
 * @param storageKey - Unique key for sessionStorage
 * @param config - Standard Formik config (initialValues, validationSchema, onSubmit, etc.)
 */
export function useFormWithSessionStorage<T extends FormikValues = FormikValues>(
  storageKey: string,
  config: FormikConfig<T>,
) {
  const [storedValues, setStoredValues, removeStoredValues] = useSessionStorage<Partial<T> | null>(
    `form_${storageKey}`,
    null,
  );

  // Merge stored values into initialValues
  const mergedInitialValues: T = storedValues
    ? { ...config.initialValues, ...storedValues }
    : config.initialValues;

  const formik = useForm<T>({
    ...config,
    initialValues: mergedInitialValues,
    onSubmit: async (values, helpers) => {
      await config.onSubmit(values, helpers);
      removeStoredValues();
    },
  });

  // Track previous values to avoid unnecessary writes
  const prevValuesRef = useRef<string>(JSON.stringify(formik.values));

  // Persist form values to sessionStorage on change
  useEffect(() => {
    const serialized = JSON.stringify(formik.values);
    if (serialized !== prevValuesRef.current) {
      prevValuesRef.current = serialized;
      setStoredValues(formik.values);
    }
  }, [formik.values, setStoredValues]);

  // Wrap resetForm to also clear sessionStorage
  const originalResetForm = formik.resetForm;
  const resetForm: typeof formik.resetForm = (...args) => {
    removeStoredValues();
    originalResetForm(...args);
  };

  return { ...formik, resetForm, clearSessionStorage: removeStoredValues };
}
