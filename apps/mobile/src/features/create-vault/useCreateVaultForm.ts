import { useMemo, useState } from "react";

import { createCreateVaultSchema } from "@pocket-vault/shared";
import { createVaultDefaults } from "./createVaultDefaults";
import type { CreateVaultInput } from "../../types";
import { useI18n } from "../../lib/i18n";

type CreateVaultField = keyof CreateVaultInput;

const stepFields: Record<number, CreateVaultField[]> = {
  0: ["goalName", "category", "note", "targetAmount", "accentTheme"],
  1: ["ruleType", "unlockDate", "cooldownDays", "guardianAddress"],
  2: ["goalName", "category", "note", "targetAmount", "accentTheme", "ruleType", "unlockDate", "cooldownDays", "guardianAddress"],
};

export const useCreateVaultForm = () => {
  const { messages } = useI18n();
  const [values, setValues] = useState<CreateVaultInput>(createVaultDefaults);
  const [errors, setErrors] = useState<Partial<Record<CreateVaultField, string>>>({});
  const [step, setStep] = useState(0);
  const createVaultSchema = useMemo(
    () =>
      createCreateVaultSchema({
        goalNameRequired: messages.validation.createVault.goalNameRequired,
        goalNameMax: messages.validation.createVault.goalNameMax,
        categoryMax: messages.validation.createVault.categoryMax,
        noteMax: messages.validation.createVault.noteMax,
        targetAmount: messages.validation.createVault.targetAmount,
        ruleType: messages.validation.createVault.ruleType,
        unlockDate: messages.validation.createVault.unlockDate,
        cooldownDays: messages.validation.createVault.cooldownDays,
        guardianAddress: messages.validation.createVault.guardianAddress,
        guardianNotOwner: messages.validation.createVault.guardianNotOwner,
      }),
    [messages.validation.createVault],
  );

  const validateFields = (fields: CreateVaultField[]) => {
    const result = createVaultSchema.safeParse(values);

    if (result.success) {
      setErrors((current) => {
        const nextErrors = { ...current };
        for (const field of fields) {
          nextErrors[field] = undefined;
        }

        return nextErrors;
      });
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
      ...Object.fromEntries(fields.map((field) => [field, undefined])),
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
      goalName: values.goalName || messages.pages.createVault.preview.emptyGoal,
      category: values.category || undefined,
      note: values.note || messages.pages.createVault.preview.emptyNote,
      targetAmount: Number.isFinite(amount) ? amount : 0,
      accentTheme: values.accentTheme || "",
      ruleType: values.ruleType,
      unlockDate: values.unlockDate,
      cooldownDays: values.cooldownDays,
      guardianAddress: values.guardianAddress,
    };
  }, [messages.pages.createVault.preview.emptyGoal, messages.pages.createVault.preview.emptyNote, values]);

  return {
    values,
    errors,
    step,
    preview,
    setFieldValue,
    nextStep,
    previousStep,
    setStep,
    reset: () => {
      setValues(createVaultDefaults);
      setErrors({});
      setStep(0);
    },
    validateAll: () => validateFields(stepFields[2]),
  };
};
