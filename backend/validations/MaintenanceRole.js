import * as yup from "yup";

export const maintenanceRuleSchema = yup.object({
  type: yup.string().oneOf(['truck', 'trailer', 'pneu']).required('Le type est obligatoire'),
  action: yup.string().oneOf(['vidange','revision','changement_pneu','controle_securite','autre'])
             .required('L\'action est obligatoire'),
  intervalKm: yup.number().min(0, 'intervalKm doit être >= 0'),
  intervalDays: yup.number().min(0, 'intervalDays doit être >= 0'),
  description: yup.string(),
  active: yup.boolean(),
});