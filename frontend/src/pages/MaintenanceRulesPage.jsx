import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMaintenanceRules, selectRule, deleteMaintenanceRule, updateMaintenanceRule, createMaintenanceRule } from "../features/maintenanceRuleSlice";
import Sidebare from "../components/sidebare";
import MaintenanceRuleModal from "../components/MaintenanceRuleModal";
import { Settings, Calendar, Gauge, CheckCircle, XCircle } from "lucide-react";

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
    if (window.confirm("Supprimer cette règle de maintenance ?")) {
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

  const getActionLabel = (action) => {
    const labels = {
      vidange: "Vidange",
      revision: "Révision",
      changement_pneu: "Changement de pneu",
      controle_securite: "Contrôle de sécurité",
      autre: "Autre"
    };
    return labels[action] || action;
  };

  const getTypeLabel = (type) => {
    const labels = {
      truck: "🚛 Camion",
      trailer: "🚚 Remorque",
      pneu: "⚙️ Pneu"
    };
    return labels[type] || type;
  };

  return (
    <div className="flex gap-6 min-h-screen p-6 bg-gray-50">
      <Sidebare />

      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#2a6570]" />
            <h2 className="text-xl font-semibold text-[#2a6570]">Règles de maintenance</h2>
          </div>
          <button 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" 
            onClick={() => setModalRule({})}
            disabled={isSubmitting}
          >
            + Ajouter
          </button>
        </div>

        {loading && list.length === 0 && <p className="p-4 text-gray-500">Chargement des règles...</p>}
        
        {error && <p className="p-4 text-red-500">{error}</p>}

        {isSubmitting && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#2a6570] font-medium">Traitement en cours...</span>
            </div>
          </div>
        )}

        {!loading || list.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Action</th>
                <th className="p-3">Intervalle KM</th>
                <th className="p-3">Intervalle Jours</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(rule => (
                <tr 
                  key={rule._id} 
                  className="border-b hover:bg-[#f0f9fa] cursor-pointer" 
                  onClick={() => dispatch(selectRule(rule))}
                >
                  <td className="p-3">{getTypeLabel(rule.type)}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                      {getActionLabel(rule.action)}
                    </span>
                  </td>
                  <td className="p-3">
                    {rule.intervalKm > 0 ? (
                      <div className="flex items-center gap-1 text-blue-700">
                        <Gauge className="w-4 h-4" />
                        <span className="font-semibold">{rule.intervalKm} km</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {rule.intervalDays > 0 ? (
                      <div className="flex items-center gap-1 text-green-700">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">{rule.intervalDays} jours</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {rule.active ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); setModalRule(rule); }}
                      disabled={isSubmitting}
                    >
                      Modifier
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); handleDelete(rule._id); }}
                      disabled={isSubmitting}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <div className="w-1/3 bg-white rounded-xl shadow p-4">
        {selectedRule ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Détails de la règle
            </h2>
            <div className="space-y-3">
              <p><b>Type :</b> {getTypeLabel(selectedRule.type)}</p>
              <p><b>Action :</b> <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">{getActionLabel(selectedRule.action)}</span></p>
              
              {selectedRule.intervalKm > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-800 flex items-center gap-1">
                    <Gauge className="w-4 h-4" />
                    Intervalle kilométrique
                  </p>
                  <p className="text-sm">{selectedRule.intervalKm} km</p>
                </div>
              )}

              {selectedRule.intervalDays > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-800 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Intervalle temporel
                  </p>
                  <p className="text-sm">{selectedRule.intervalDays} jours</p>
                </div>
              )}

              <p><b>Statut :</b> {selectedRule.active ? (
                <span className="text-green-600 font-semibold">✓ Active</span>
              ) : (
                <span className="text-red-600 font-semibold">✗ Inactive</span>
              )}</p>

              {selectedRule.description && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-700">Description :</p>
                  <p className="text-sm text-gray-600">{selectedRule.description}</p>
                </div>
              )}

              <p className="text-sm text-gray-500"><b>Créée le :</b> {new Date(selectedRule.createdAt).toLocaleDateString()}</p>
            </div>
          </>
        ) : <p className="text-gray-500">Sélectionnez une règle pour voir les détails</p>}
      </div>

      {modalRule && <MaintenanceRuleModal rule={modalRule} onClose={() => setModalRule(null)} onSave={handleSave} />}
    </div>
  );
}