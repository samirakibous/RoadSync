import * as yup from "yup";
export const maintenanceSchema = yup.object({
  resourceType: yup.string().oneOf(['truck', 'trailer', 'pneu']).required('Le type de ressource est obligatoire'),
  resource: yup.string().required('La ressource est obligatoire'),
  rule: yup.string(),
  notes: yup.string(),
  kmAtMaintenance: yup.number().min(0, 'kmAtMaintenance doit être >= 0')
});