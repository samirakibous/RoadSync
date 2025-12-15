import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMaintenanceRules, selectRule, deleteMaintenanceRule, updateMaintenanceRule, createMaintenanceRule } from "../features/maintenanceRuleSlice";
import { 
  Settings, 
  Calendar, 
  Gauge, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Info,
  AlertCircle,
  Truck,
  FileText,
  Clock
} from "lucide-react";
import Sidebare from "../components/sidebare";
import MaintenanceRuleModal from "../components/MaintenanceRuleModal";

export default function MaintenanceRulesPage() {
  const dispatch = useDispatch();
  const { list, selectedRule, loading, error } = useSelector(state => state.maintenanceRules);
  const [modalRule, setModalRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchMaintenanceRules()); 
  }, [dispatch]);

  const handleSave = async (rule) => {
    setIsSubmitting(true);
    try {
      if (rule._id) {
        await dispatch(updateMaintenanceRule({ id: rule._id, ruleData: rule })).unwrap();
      } else {
        await dispatch(createMaintenanceRule(rule)).unwrap();
      }
      await dispatch(fetchMaintenanceRules()).unwrap();
      setModalRule(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette règle de maintenance ?")) {
      setIsSubmitting(true);
      try {
        await dispatch(deleteMaintenanceRule(ruleId)).unwrap();
        await dispatch(fetchMaintenanceRules()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getActionBadge = (action) => {
    const actionConfig = {
      vidange: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Vidange' },
      revision: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Révision' },
      changement_pneu: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Changement de pneu' },
      controle_securite: { bg: 'bg-green-100', text: 'text-green-700', label: 'Contrôle de sécurité' },
      autre: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Autre' }
    };
    
    const config = actionConfig[action] || actionConfig.autre;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      truck: { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', label: 'Camion', icon: Truck },
      trailer: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Remorque', icon: Truck },
      pneu: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pneu', icon: Settings }
    };
    
    const config = typeConfig[type] || typeConfig.truck;
    const IconComponent = config.icon;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebare />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex gap-6 p-6 relative">
        {/* TABLEAU DES RÈGLES */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Règles de maintenance</h2>
                <p className="text-sm text-gray-500">{list.length} règle(s) configurée(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              onClick={() => setModalRule({})}
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              Ajouter une règle
            </button>
          </div>

          {/* Loading & Error */}
          {loading && list.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des règles...</p>
            </div>
          )}
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Overlay de chargement */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-xl border border-gray-200">
                <div className="w-6 h-6 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#2a6570] font-semibold">Traitement en cours...</span>
              </div>
            </div>
          )}

          {/* Table */}
          {(!loading || list.length > 0) && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Intervalle KM
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Intervalle Jours
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map(rule => (
                    <tr 
                      key={rule._id} 
                      className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                      onClick={() => dispatch(selectRule(rule))}
                    >
                      <td className="px-6 py-4">
                        {getTypeBadge(rule.type)}
                      </td>
                      <td className="px-6 py-4">
                        {getActionBadge(rule.action)}
                      </td>
                      <td className="px-6 py-4">
                        {rule.intervalKm > 0 ? (
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-[#3b8492]" />
                            <span className="font-semibold text-gray-900">{rule.intervalKm.toLocaleString()} km</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {rule.intervalDays > 0 ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-gray-900">{rule.intervalDays} jours</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {rule.active ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-700">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-[#3b8492]/10 text-[#3b8492] rounded-lg hover:bg-[#3b8492]/20 transition disabled:opacity-50"
                            onClick={e => { e.stopPropagation(); setModalRule(rule); }}
                            disabled={isSubmitting}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            onClick={e => { e.stopPropagation(); handleDelete(rule._id); }}
                            disabled={isSubmitting}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {list.length === 0 && !loading && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Settings className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucune règle configurée</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre première règle de maintenance</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DE LA RÈGLE */}
        <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#2a6570]">Détails</h2>
            </div>
          </div>

          <div className="p-6">
            {selectedRule ? (
              <div className="space-y-4">
                {/* Type de ressource */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <p className="text-xs font-semibold text-[#2a6570] uppercase mb-2">Type de ressource</p>
                  {getTypeBadge(selectedRule.type)}
                </div>

                {/* Action */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Action de maintenance</p>
                  {getActionBadge(selectedRule.action)}
                </div>

                {/* Intervalle kilométrique */}
                {selectedRule.intervalKm > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Gauge className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Intervalle kilométrique</p>
                        <p className="text-2xl font-bold text-blue-700">{selectedRule.intervalKm.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Intervalle temporel */}
                {selectedRule.intervalDays > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Intervalle temporel</p>
                        <p className="text-2xl font-bold text-green-700">{selectedRule.intervalDays} jours</p>
                        <p className="text-sm text-gray-600 mt-1">≈ {Math.round(selectedRule.intervalDays / 30)} mois</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statut */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Statut</p>
                  {selectedRule.active ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-bold text-green-700">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-lg font-bold text-red-700">Inactive</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedRule.description && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                        <p className="text-sm text-gray-700">{selectedRule.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Créée le {new Date(selectedRule.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedRule.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur une règle pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalRule && (
        <MaintenanceRuleModal 
          rule={modalRule} 
          onClose={() => setModalRule(null)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}