import * as yup from "yup";

export const TruckSchema = yup.object({
  immatriculation: yup
    .string()
    .trim()
    .required("L'immatriculation est obligatoire"),

  modele: yup
    .string()
    .trim()
    .required("Le modèle est obligatoire"),

  kilometrage: yup
    .number()
    .min(0, "Le kilométrage ne peut pas être négatif")
    .default(0),

  status: yup
    .string()
    .oneOf(
      ["disponible", "en_mission", "en_maintenance", "hors_service"],
      "Statut invalide"
    )
    .default("disponible"),

  dateAchat: yup
    .date()
    .typeError("Date d'achat invalide")
    .required("La date d'achat est obligatoire"),

  derniereMaintenance: yup
    .date()
    .nullable()
    .typeError("Date de dernière maintenance invalide"),
});
