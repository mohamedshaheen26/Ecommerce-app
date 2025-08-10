  import * as yup from "yup";
  import { UserRole, type IEmployeeValidation } from "../types";

  export const employeeSchema: yup.ObjectSchema<IEmployeeValidation>  = yup.object({
    full_name: yup.string().required("Full Name is required."),
    email: yup.string().email("Invalid email.").required("Email is required."),
    username: yup
      .string()
      .min(3, "Username must be at least 3 characters.")
      .required("Username is required."),
    password: yup.string().test({
      name: "password-required-if-not-editing",
      test: function (value) {
        const { isEditing } = this.options.context || {};
        if (!isEditing && (!value || value.length < 6)) {
          return this.createError({ message: "Password must be at least 6 characters." });
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
          return this.createError({ message: "Passwords do not match." });
        }
        return true;
      },
    }),
    role: yup
      .mixed<UserRole>()
      .oneOf([UserRole.Employee, UserRole.Admin])
      .required("Role is required."),
    phone: yup
      .string()
      .test(
        "valid-phone",
        "Phone number must be 11 digits.",
        (value) => !value || /^\d{11}$/.test(value)
      )
    .notRequired(),
    address: yup
      .string()
      .max(255, "Address cannot exceed 255 characters.")
      .notRequired(),
    salary: yup 
      .number()
      .min(0, "Salary must be a positive number.")
      .notRequired(),
    hire_date: yup
      .date()
      .max(new Date(), "Hire date cannot be in the future.")
      .required(),
  });
