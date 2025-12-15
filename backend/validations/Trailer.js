import * as yup from "yup";

export const createTrailerSchema = yup.object({
  plateNumber: yup
    .string()
    .trim()
    .required("Le numéro de plaque est obligatoire"),

  type: yup
    .string()
    .trim()
    .required("Le type de remorque est obligatoire"),

  maxLoad: yup
    .number()
    .min(0, "La charge maximale ne peut pas être négative")
    .required("La charge maximale est obligatoire"),

  status: yup
    .string()
    .oneOf(
      ["disponible", "en_mission", "en_maintenance", "hors_service"],
      "Statut invalide"
    )
    .default("disponible"),

  purchaseDate: yup
    .date()
    .typeError("Date d’achat invalide")
    .required("La date d’achat est obligatoire"),

  lastMaintenance: yup
    .date()
    .nullable()
    .typeError("Date de dernière maintenance invalide")
    .min(
      yup.ref("purchaseDate"),
      "La dernière maintenance ne peut pas être avant la date d’achat"
    ),
});


export const updateTrailerSchema = yup.object({
  plateNumber: yup.string().trim(),
  type: yup.string().trim(),
  maxLoad: yup.number().min(0, "La charge maximale ne peut pas être négative"),
  status: yup.string().oneOf(
    ["disponible", "en_mission", "en_maintenance", "hors_service"],
    "Statut invalide"
  ),
  purchaseDate: yup.date().typeError("Date d’achat invalide"),
  lastMaintenance: yup
    .date()
    .nullable()
    .typeError("Date de dernière maintenance invalide")
    .min(
      yup.ref("purchaseDate"),
      "La dernière maintenance ne peut pas être avant la date d’achat"
    ),
});
