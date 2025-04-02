import { useState, useCallback, FormEvent } from 'react';
import { useNotification } from './useNotification';

interface FormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: FormOptions<T>) {
  const notification = useNotification();

  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
  });

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setFormState(prev => ({
        ...prev,
        values: { ...prev.values, [field]: value },
        touched: { ...prev.touched, [field]: true },
        isDirty: true,
      }));
    },
    []
  );

  const setFieldTouched = useCallback(
    (field: keyof T) => {
      setFormState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: true },
      }));
    },
    []
  );

  const validateForm = useCallback(() => {
    if (!validate) return {};

    const errors = validate(formState.values);
    setFormState(prev => ({ ...prev, errors }));
    return errors;
  }, [formState.values, validate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        notification.error('Por favor, corrija os erros no formulário');
        return;
      }

      setFormState(prev => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit(formState.values);
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isDirty: false,
        }));
      } catch (error) {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        notification.error(
          error instanceof Error ? error.message : 'Ocorreu um erro ao enviar o formulário'
        );
      }
    },
    [formState.values, onSubmit, validateForm, notification]
  );

  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialValues]);

  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      isDirty: true,
    }));
  }, []);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isDirty: formState.isDirty,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
    setValues,
    validateForm,
  };
} 