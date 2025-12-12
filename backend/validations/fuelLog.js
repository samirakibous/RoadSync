import * as yup from 'yup';

export const fuelLogSchema = yup.object({
  montant: yup
    .number()
    .required("Le montant est obligatoire")
    .min(1, "Le montant doit être supérieur à 0"),

  factureType: yup
    .string()
    .oneOf(['image', 'pdf'], "factureType doit être 'image' ou 'pdf'")
    .required("Le type de facture est obligatoire"),

});
