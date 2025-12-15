import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMaintenances, selectMaintenance, deleteMaintenance, updateMaintenance, createMaintenance, completeMaintenance } from "../features/maintenanceSlice";
import { 
  Wrench,
  Plus, 
  Edit2, 
  Trash2, 
  Info,
  Truck,
  Calendar,
  AlertCircle,
  Gauge,
  FileText,
  Settings,
  CheckCircle
} from "lucide-react";
import Sidebare from "../components/sidebare";
import MaintenanceModal from "../components/MaintenanceModal";

export default function MaintenancePage() {
  const dispatch = useDispatch();
  const { list, selectedMaintenance, loading, error } = useSelector(state => state.maintenances);
  const [modalMaintenance, setModalMaintenance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchMaintenances()); 
  }, [dispatch]);

  const handleSave = async (maintenance) => {
    setIsSubmitting(true);
    try {
      if (maintenance._id) {
        await dispatch(updateMaintenance({ id: maintenance._id, maintenanceData: maintenance })).unwrap();
      } else {
        await dispatch(createMaintenance(maintenance)).unwrap();
      }
      await dispatch(fetchMaintenances()).unwrap();
      setModalMaintenance(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (maintenanceId) => {
    if (window.confirm("Marquer cette maintenance comme terminée ?")) {
      setIsSubmitting(true);
      try {
        await dispatch(completeMaintenance({ id: maintenanceId, completionData: {} })).unwrap();
        await dispatch(fetchMaintenances()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la complétion:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (maintenanceId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette maintenance ?")) {
      setIsSubmitting(true);
      try {
        await dispatch(deleteMaintenance(maintenanceId)).unwrap();
        await dispatch(fetchMaintenances()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getResourceInfo = (maintenance) => {
    const resource = maintenance.resource;
    if (!resource) return { text: "N/A", icon: null };
    
    if (maintenance.resourceType === "truck") {
      return { 
        text: resource.immatriculation || 'N/A',
        subtitle: `${resource.marque || ''} ${resource.modele || ''}`.trim(),
        icon: Truck
      };
    } else if (maintenance.resourceType === "trailer") {
      return { 
        text: resource.plateNumber || 'N/A',
        subtitle: resource.type || '',
        icon: Truck
      };
    } else if (maintenance.resourceType === "pneu") {
      return { 
        text: `${resource.marque || 'N/A'}`,
        subtitle: `Position: ${resource.position || 'N/A'}`,
        icon: Settings
      };
    }
    
    return { text: "N/A", icon: null };
  };

  const getResourceTypeBadge = (type) => {
    const typeConfig = {
      'truck': { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', label: 'Camion', icon: Truck },
      'trailer': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Remorque', icon: Truck },
      'pneu': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pneu', icon: Settings }
    };
    
    const config = typeConfig[type] || typeConfig['truck'];
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
        {/* TABLEAU DES MAINTENANCES */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Gestion des maintenances</h2>
                <p className="text-sm text-gray-500">{list.length} maintenance(s) enregistrée(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              onClick={() => setModalMaintenance({})}
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              Ajouter une maintenance
            </button>
          </div>

          {/* Loading & Error */}
          {loading && list.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des maintenances...</p>
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
                      Ressource
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Règle / Action
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
                  {list.map(maintenance => {
                    const resourceInfo = getResourceInfo(maintenance);
                    return (
                      <tr 
                        key={maintenance._id} 
                        className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                        onClick={() => dispatch(selectMaintenance(maintenance))}
                      >
                        <td className="px-6 py-4">
                          {getResourceTypeBadge(maintenance.resourceType)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {resourceInfo.icon && (
                              <div className="w-8 h-8 bg-[#3b8492]/10 rounded-lg flex items-center justify-center">
                                <resourceInfo.icon className="w-4 h-4 text-[#3b8492]" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{resourceInfo.text}</p>
                              {resourceInfo.subtitle && (
                                <p className="text-xs text-gray-500">{resourceInfo.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {maintenance.rule ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900">{maintenance.rule.action || 'N/A'}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {maintenance.status === 'completed' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Terminée
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              En cours
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {maintenance.status === 'pending' && (
                              <button
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                                onClick={e => { e.stopPropagation(); handleComplete(maintenance._id); }}
                                disabled={isSubmitting}
                                title="Terminer la maintenance"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="p-2 bg-[#3b8492]/10 text-[#3b8492] rounded-lg hover:bg-[#3b8492]/20 transition disabled:opacity-50"
                              onClick={e => { e.stopPropagation(); setModalMaintenance(maintenance); }}
                              disabled={isSubmitting}
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                              onClick={e => { e.stopPropagation(); handleDelete(maintenance._id); }}
                              disabled={isSubmitting}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {list.length === 0 && !loading && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Wrench className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucune maintenance enregistrée</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre première maintenance</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DE LA MAINTENANCE */}
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
            {selectedMaintenance ? (
              <div className="space-y-4">
                {/* Statut */}
                <div className={`p-4 rounded-lg border ${selectedMaintenance.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center gap-3">
                    {selectedMaintenance.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                          <p className="font-bold text-green-700">Maintenance terminée</p>
                          {selectedMaintenance.completedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Terminée le {new Date(selectedMaintenance.completedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                          <p className="font-bold text-orange-700">Maintenance en cours</p>
                        </div>
                        <button
                          onClick={() => handleComplete(selectedMaintenance._id)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Terminer
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Type de ressource */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <p className="text-xs font-semibold text-[#2a6570] uppercase mb-2">Type de ressource</p>
                  {getResourceTypeBadge(selectedMaintenance.resourceType)}
                </div>

                {/* Ressource concernée */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <Truck className="w-5 h-5 text-[#3b8492] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ressource concernée</p>
                      <p className="font-bold text-gray-900">{getResourceInfo(selectedMaintenance).text}</p>
                      {getResourceInfo(selectedMaintenance).subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{getResourceInfo(selectedMaintenance).subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Règle de maintenance */}
                {selectedMaintenance.rule && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Règle de maintenance</p>
                        <p className="font-semibold text-gray-900">{selectedMaintenance.rule.action || 'N/A'}</p>
                        {selectedMaintenance.rule.intervalKm && (
                          <p className="text-sm text-gray-600 mt-1">
                            Intervalle: {selectedMaintenance.rule.intervalKm.toLocaleString()} km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Kilométrage */}
                {selectedMaintenance.kmAtMaintenance > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <Gauge className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Kilométrage</p>
                        <p className="text-2xl font-bold text-green-700">
                          {selectedMaintenance.kmAtMaintenance.toLocaleString()} km
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedMaintenance.notes && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{selectedMaintenance.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Créée le {new Date(selectedMaintenance.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedMaintenance.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur une maintenance pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalMaintenance && (
        <MaintenanceModal 
          maintenance={modalMaintenance} 
          onClose={() => setModalMaintenance(null)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}