import * as yup from "yup";
import { useTranslation } from "react-i18next";

export interface IRegisterValidation {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export const getRegisterSchema = () => {
  const { t } = useTranslation();
  
  return yup.object<IRegisterValidation>({
    fullName: yup
      .string()
      .required(t("validations.name_required"))
      .min(2, t("validations.name_min")),
    email: yup
      .string()
      .email(t("validations.email_invalid"))
      .required(t("validations.email_required")),
    phone: yup
      .string()
      .test(
        "valid-phone",
        t("validations.phone_invalid"),
        (value) => !value || /^\d{11}$/.test(value)
      )
      .default("")
      .notRequired(),
    password: yup
      .string()
      .required(t("validations.password_required"))
      .min(6, t("validations.password_min")),
  });
};

