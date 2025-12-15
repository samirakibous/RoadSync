import * as yup from "yup";

export const createTripSchema = yup.object({
  truck: yup
    .string()
    .required("Le camion est obligatoire"),

  trailer: yup.string().nullable(), // optionnel
  driver: yup.string().nullable(),  // optionnel

  lieuDepart: yup
    .string()
    .trim()
    .required("Le lieu de départ est obligatoire"),

  lieuArrivee: yup
    .string()
    .trim()
    .required("Le lieu d'arrivée est obligatoire"),

  datDepart: yup
    .date()
    .typeError("Date de départ invalide")
    .required("La date de départ est obligatoire"),

  dateArrivee: yup
    .date()
    .typeError("Date d'arrivée invalide")
    .min(yup.ref("datDepart"), "La date d'arrivée doit être après la date de départ")
    .required("La date d'arrivée est obligatoire"),

  status: yup
    .string()
    .oneOf(["a-faire", "en-cours", "termine"], "Statut invalide")
    .default("a-faire"),

  carburantPrevu: yup.number().min(0, "Valeur invalide").nullable(),
  carburantDepart: yup.number().min(0, "Valeur invalide").nullable(),
  carburantArrivee: yup.number().min(0, "Valeur invalide").nullable(),

  kmDepart: yup.number().min(0, "Valeur invalide").nullable(),
  kmArrivee: yup.number().min(0, "Valeur invalide").nullable(),

  type: yup
    .string()
    .oneOf(["livraison", "transport", "autres"], "Type invalide")
    .default("livraison"),

  poidsCargo: yup.number().min(0, "Valeur invalide").nullable(),

  description: yup.string().nullable(),
  notes: yup.string().nullable(),
  remarquesVehicule: yup.string().nullable(),
});


export const updateTripSchema = yup.object({
  truck: yup.string(),
  trailer: yup.string().nullable(),
  driver: yup.string().nullable(),

  lieuDepart: yup.string().trim(),
  lieuArrivee: yup.string().trim(),

  datDepart: yup.date().typeError("Date de départ invalide"),
  dateArrivee: yup
    .date()
    .typeError("Date d'arrivée invalide")
    .min(yup.ref("datDepart"), "La date d'arrivée doit être après la date de départ"),

  status: yup.string().oneOf(["a-faire", "en-cours", "termine"], "Statut invalide"),

  carburantPrevu: yup.number().min(0, "Valeur invalide"),
  carburantDepart: yup.number().min(0, "Valeur invalide"),
  carburantArrivee: yup.number().min(0, "Valeur invalide"),

  kmDepart: yup.number().min(0, "Valeur invalide"),
  kmArrivee: yup.number().min(0, "Valeur invalide"),

  type: yup.string().oneOf(["livraison", "transport", "autres"], "Type invalide"),

  poidsCargo: yup.number().min(0, "Valeur invalide"),

  description: yup.string().nullable(),
  notes: yup.string().nullable(),
  remarquesVehicule: yup.string().nullable(),
});
