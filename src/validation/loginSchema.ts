import * as yup from "yup";
import { useTranslation } from "react-i18next";

export interface ILoginValidation {
  usernameOrEmail: string;
  password: string;
}

export const getLoginSchema = () => {
  const { t } = useTranslation();
  
  return yup.object<ILoginValidation>({
    usernameOrEmail: yup
      .string()
      .required(t("validations.username_or_email_required")),
    password: yup
      .string()
      .required(t("validations.password_required"))
      .min(6, t("validations.password_min")),
  });
};

