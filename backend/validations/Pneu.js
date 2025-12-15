import * as yup from "yup";

export const createPneuSchema = yup.object({
  position: yup
    .string()
    .oneOf(
      ["avant gauche", "avant droite", "arriere gauche", "arriere droite"],
      "Position invalide"
    )
    .required("La position est obligatoire"),

  usurePourcentage: yup
    .number()
    .min(0, "L'usure doit être ≥ 0")
    .max(100, "L'usure doit être ≤ 100")
    .default(0),

  truck: yup.string().nullable(),
  trailer: yup.string().nullable(),

  status: yup
    .string()
    .oneOf(
      ["disponible", "en_mission", "en_maintenance", "hors_service"],
      "Statut invalide"
    )
    .default("disponible"),

  marque: yup
    .string()
    .trim()
    .required("La marque est obligatoire"),

  lastMaintenance: yup
    .date()
    .nullable()
    .typeError("Date de dernière maintenance invalide"),

  dateInstallation: yup
    .date()
    .nullable()
    .typeError("Date d'installation invalide")
})
.test(
  "truck-or-trailer",
  "Un pneu ne peut pas être attaché à la fois à un camion et à une remorque",
  (value) => !(value.truck && value.trailer)
);


export const updatePneuSchema = yup.object({
  position: yup.string().oneOf(
    ["avant gauche", "avant droite", "arriere gauche", "arriere droite"],
    "Position invalide"
  ),
  usurePourcentage: yup.number().min(0, "L'usure doit être ≥ 0").max(100, "L'usure doit être ≤ 100"),
  truck: yup.string().nullable(),
  trailer: yup.string().nullable(),
  status: yup.string().oneOf(
    ["disponible", "en_mission", "en_maintenance", "hors_service"],
    "Statut invalide"
  ),
  marque: yup.string().trim(),
  lastMaintenance: yup.date().nullable().typeError("Date de dernière maintenance invalide"),
  dateInstallation: yup.date().nullable().typeError("Date d'installation invalide")
})
.test(
  "truck-or-trailer",
  "Un pneu ne peut pas être attaché à la fois à un camion et à une remorque",
  (value) => !(value.truck && value.trailer)
);
