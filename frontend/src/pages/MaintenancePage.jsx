import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMaintenances, selectMaintenance, deleteMaintenance, updateMaintenance, createMaintenance } from "../features/maintenanceSlice";
import Sidebare from "../components/sidebare";
import MaintenanceModal from "../components/MaintenanceModal";
import { Wrench } from "lucide-react";

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

  const handleDelete = async (maintenanceId) => {
    if (window.confirm("Supprimer cette maintenance ?")) {
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
    // ✅ Récupérer la ressource depuis le champ 'resource' populé
    const resource = maintenance.resource;
    
    if (!resource) return "N/A";
    
    if (maintenance.resourceType === "truck") {
      return `🚛 ${resource.immatriculation || 'N/A'}`;
    } else if (maintenance.resourceType === "trailer") {
      return `🚚 ${resource.plateNumber || 'N/A'}`;
    } else if (maintenance.resourceType === "pneu") {
      return `⚙️ ${resource.marque || 'N/A'} (${resource.position || 'N/A'})`;
    }
    
    return "N/A";
  };

  return (
    <div className="flex gap-6 min-h-screen p-6 bg-gray-50">
      <Sidebare />

      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#2a6570]" />
            <h2 className="text-xl font-semibold text-[#2a6570]">Gestion des maintenances</h2>
          </div>
          <button 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" 
            onClick={() => setModalMaintenance({})}
            disabled={isSubmitting}
          >
            + Ajouter
          </button>
        </div>

        {loading && list.length === 0 && <p className="p-4 text-gray-500">Chargement des maintenances...</p>}
        
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
                <th className="p-3">Type de ressource</th>
                <th className="p-3">Ressource</th>
                <th className="p-3">Règle</th>
                <th className="p-3">Km</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(maintenance => (
                <tr 
                  key={maintenance._id} 
                  className="border-b hover:bg-[#f0f9fa] cursor-pointer" 
                  onClick={() => dispatch(selectMaintenance(maintenance))}
                >
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                      {maintenance.resourceType === 'truck' ? '🚛 Camion' : maintenance.resourceType === 'trailer' ? '🚚 Remorque' : '⚙️ Pneu'}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{getResourceInfo(maintenance)}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {maintenance.rule ? (
                      <span className="text-xs bg-blue-50 px-2 py-1 rounded">{maintenance.rule.action || 'N/A'}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {maintenance.kmAtMaintenance > 0 ? (
                      <span className="font-semibold">{maintenance.kmAtMaintenance} km</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{maintenance.notes || '-'}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50 text-xs" 
                      onClick={e => { e.stopPropagation(); setModalMaintenance(maintenance); }}
                      disabled={isSubmitting}
                    >
                      Modifier
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 rounded disabled:opacity-50 text-xs" 
                      onClick={e => { e.stopPropagation(); handleDelete(maintenance._id); }}
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
        {selectedMaintenance ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Détails de la maintenance
            </h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Type de ressource</p>
                <p className="font-semibold">
                  {selectedMaintenance.resourceType === 'truck' ? '🚛 Camion' : 
                   selectedMaintenance.resourceType === 'trailer' ? '🚚 Remorque' : '⚙️ Pneu'}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Ressource concernée</p>
                <p className="font-semibold">{getResourceInfo(selectedMaintenance)}</p>
                {selectedMaintenance.resource && (
                  <>
                    {selectedMaintenance.resourceType === "truck" && selectedMaintenance.resource.marque && (
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedMaintenance.resource.marque} {selectedMaintenance.resource.modele}
                      </p>
                    )}
                    {selectedMaintenance.resourceType === "trailer" && selectedMaintenance.resource.type && (
                      <p className="text-xs text-gray-600 mt-1">Type: {selectedMaintenance.resource.type}</p>
                    )}
                  </>
                )}
              </div>

              {selectedMaintenance.rule && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Règle de maintenance</p>
                  <p className="font-semibold">{selectedMaintenance.rule.action || 'N/A'}</p>
                  {selectedMaintenance.rule.intervalKm && (
                    <p className="text-xs text-gray-600 mt-1">Intervalle: {selectedMaintenance.rule.intervalKm} km</p>
                  )}
                </div>
              )}

              {selectedMaintenance.kmAtMaintenance > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Kilométrage au moment de la maintenance</p>
                  <p className="font-bold text-2xl text-green-700">{selectedMaintenance.kmAtMaintenance} km</p>
                </div>
              )}

              {selectedMaintenance.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{selectedMaintenance.notes}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-3 border-t">
                <p>Créée le : {new Date(selectedMaintenance.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </>
        ) : <p className="text-gray-500">Sélectionnez une maintenance pour voir les détails</p>}
      </div>

      {modalMaintenance && <MaintenanceModal maintenance={modalMaintenance} onClose={() => setModalMaintenance(null)} onSave={handleSave} />}
    </div>
  );
}
