import * as yup from "yup";
import { UserRole, type IEmployeeValidation } from "../types";
import { useTranslation } from "react-i18next";

export const getEmployeeSchema = () => {
  const { t } = useTranslation();

  return yup.object<IEmployeeValidation>({
    full_name: yup.string().required(t("validations.name_required")),
    name_ar: yup.string().required(t("validations.name_ar_required")),
    email: yup
      .string()
      .email(t("validations.email_invalid"))
      .required(t("validations.email_required")),
    username: yup.string().required(t("validations.username_required")),
    password: yup.string().test({
      name: "password-required-if-not-editing",
      test: function (value) {
        const { isEditing } = this.options.context || {};
        if (!isEditing && (!value || value.length < 6)) {
          return this.createError({
            message: t("validations.password_min"),
          });
        }
        return true;
      },
    }),
    confirm_password: yup.string().test({
      name: "confirm-password-match-if-not-editing",
      test: function (value) {
        const { isEditing } = this.options.context || {};
        const password = this.parent.password;
        if (!isEditing && value !== password) {
          return this.createError({
            message: t("validations.confirm_password_one_of"),
          });
        }
        return true;
      },
    }),
    role: yup
      .mixed<UserRole>()
      .transform((curr, orig) => orig === "" ? undefined : curr)
      .required(t("validations.role_required"))
      .oneOf([UserRole.Employee, UserRole.Admin], t("validations.role_values", { values: Object.values(UserRole).join(", ") })),
    phone: yup
      .string()
      .test(
        "valid-phone",
        t("validations.phone_required"),
        (value) => !value || /^\d{11}$/.test(value)
      )
      .notRequired(),
    address: yup.string().max(255).notRequired(),
    address_ar: yup.string().max(255).notRequired(),
    salary: yup
      .number()
      .min(0, t("validations.salary_positive"))
      .notRequired(),
    hire_date: yup.date()
      .transform((curr, orig) => orig === "" ? undefined : curr)
      .required(t("validations.hire_date_required"))
      .max(new Date(), t("validations.hire_date_future")),
  });
};

export const getCredentialsSchema = () => {
  const { t } = useTranslation();

  return yup.object({
    password: yup
      .string()
      .min(6, t("validations.password_min"))
      .required(t("validations.password_required")),
    confirm_password: yup
      .string()
      .oneOf([yup.ref("password")], t("validations.confirm_password_one_of"))
      .required(t("validations.confirm_password_required")),
  });
};
