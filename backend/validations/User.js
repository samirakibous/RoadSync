import * as yup from "yup";
export const UserSchema = yup.object({
name: yup
    .string()
    .trim()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .required("Le nom est obligatoire"),

  email: yup
    .string()
    .email("Email invalide")
    .required("L’email est obligatoire"),

  role: yup
    .string()
    .oneOf(["admin", "driver"], "Rôle invalide")
    .default("driver")
});