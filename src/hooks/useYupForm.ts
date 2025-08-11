import { useForm, type UseFormProps, type UseFormReturn, type DefaultValues } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { ObjectSchema } from "yup";
import type { FieldValues } from "react-hook-form";

export function useYupForm<T extends FieldValues>(
  schema: ObjectSchema<T>,
  defaultValues: DefaultValues<T>,
  options?: Omit<UseFormProps<T>, "resolver" | "defaultValues">
): UseFormReturn<T, object> {
  return useForm<T, object>({
    resolver: yupResolver(schema) as any,
    defaultValues,
    mode: "onChange",
    ...options,
  });
}
