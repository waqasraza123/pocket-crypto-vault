import { useMemo, useState } from "react";

import { createVaultSchema } from "./createVaultSchema";
import { createVaultDefaults } from "./createVaultDefaults";
import type { CreateVaultInput } from "../../types";

type CreateVaultField = keyof CreateVaultInput;

const stepFields: Record<number, CreateVaultField[]> = {
  0: ["goalName", "note", "targetAmount"],
  1: ["unlockDate"],
  2: ["goalName", "note", "targetAmount", "unlockDate"],
};

export const useCreateVaultForm = () => {
  const [values, setValues] = useState<CreateVaultInput>(createVaultDefaults);
  const [errors, setErrors] = useState<Partial<Record<CreateVaultField, string>>>({});
  const [step, setStep] = useState(0);

  const validateFields = (fields: CreateVaultField[]) => {
    const result = createVaultSchema.safeParse(values);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Partial<Record<CreateVaultField, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as CreateVaultField;
      if (fields.includes(field) && !nextErrors[field]) {
        nextErrors[field] = issue.message;
      }
    }

    setErrors((current) => ({
      ...current,
      ...nextErrors,
    }));

    return fields.every((field) => !nextErrors[field]);
  };

  const setFieldValue = <TField extends CreateVaultField>(field: TField, value: CreateVaultInput[TField]) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const nextStep = () => {
    const fields = stepFields[step];
    if (!validateFields(fields)) {
      return false;
    }

    setStep((current) => Math.min(current + 1, 2));
    return true;
  };

  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const preview = useMemo(() => {
    const amount = Number.parseFloat(values.targetAmount || "0");
    return {
      goalName: values.goalName || "Your next milestone",
      note: values.note || "A protected vault for a meaningful goal.",
      targetAmount: Number.isFinite(amount) ? amount : 0,
      unlockDate: values.unlockDate,
    };
  }, [values]);

  return {
    values,
    errors,
    step,
    preview,
    setFieldValue,
    nextStep,
    previousStep,
    validateAll: () => validateFields(stepFields[2]),
  };
};
