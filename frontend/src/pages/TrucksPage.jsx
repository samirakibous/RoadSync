import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchTrucks, 
  selectTruck, 
  deleteTruck, 
  updateTruck, 
  createTruck 
} from "../features/truckSlice";
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Gauge, 
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle
} from "lucide-react";
import Sidebare from '../components/sidebare';
import TruckModal from "../components/TruckModal";

export default function TrucksPage() {
  const dispatch = useDispatch();
  const { list, selectedTruck, loading, error } = useSelector(state => state.trucks);
  const [modalTruck, setModalTruck] = useState(null);

  useEffect(() => {
    dispatch(fetchTrucks());
  }, [dispatch]);

  const handleSave = async (truck) => {
    try {
      if (truck._id) {
        await dispatch(updateTruck({ id: truck._id, truckData: truck })).unwrap();
      } else {
        await dispatch(createTruck(truck)).unwrap();
      }
      await dispatch(fetchTrucks()).unwrap();
      setModalTruck(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    }
  };

  const handleDelete = async (truckId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce camion ?")) {
      try {
        await dispatch(deleteTruck(truckId)).unwrap();
        await dispatch(fetchTrucks()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Disponible': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'En cours': { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', icon: Clock },
      'Maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
      'Hors service': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Disponible'];
    const IconComponent = config.icon;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebare />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex gap-6 p-6">
        {/* TABLEAU DES TRUCKS */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Flotte de véhicules</h2>
                <p className="text-sm text-gray-500">{list.length} camion(s) enregistré(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={() => setModalTruck({})}
            >
              <Plus className="w-5 h-5" />
              Ajouter un camion
            </button>
          </div>

          {/* Loading & Error */}
          {loading && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des camions...</p>
            </div>
          )}
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Immatriculation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Marque / Modèle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kilométrage
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
                  {list.map((truck) => (
                    <tr 
                      key={truck._id} 
                      className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                      onClick={() => dispatch(selectTruck(truck))}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#3b8492]/10 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-[#3b8492]" />
                          </div>
                          <span className="font-semibold text-[#2a6570]">{truck.immatriculation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{truck.marque}</p>
                          <p className="text-gray-500">{truck.modele}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Gauge className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
  {typeof truck.kilometrage === 'number'
    ? truck.kilometrage.toLocaleString()
    : '—'} km
</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(truck.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-[#3b8492]/10 text-[#3b8492] rounded-lg hover:bg-[#3b8492]/20 transition"
                            onClick={(e) => { e.stopPropagation(); setModalTruck(truck); }}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(truck._id);
                            }}
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

              {list.length === 0 && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Truck className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucun camion enregistré</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre premier véhicule</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DU TRUCK */}
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
            {selectedTruck ? (
              <div className="space-y-4">
                {/* Immatriculation */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <p className="text-xs font-semibold text-[#2a6570] uppercase mb-1">Immatriculation</p>
                  <p className="text-lg font-bold text-[#2a6570]">{selectedTruck.immatriculation}</p>
                </div>

                {/* Informations principales */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Marque</p>
                    <p className="text-gray-900 font-medium">{selectedTruck.marque}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Modèle</p>
                    <p className="text-gray-900 font-medium">{selectedTruck.modele}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Kilométrage</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      {selectedTruck.kilometrage.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                    {getStatusBadge(selectedTruck.status)}
                  </div>
                </div>

                {/* Dates */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {selectedTruck.dateAchat && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#3b8492] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Date d'achat</p>
                        <p className="text-sm text-gray-900">{new Date(selectedTruck.dateAchat).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )}
                  {selectedTruck.derniereMaintenance && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#3b8492] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Dernière maintenance</p>
                        <p className="text-sm text-gray-900">{new Date(selectedTruck.derniereMaintenance).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Métadonnées */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">
                    Créé le {new Date(selectedTruck.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-400">
                    Modifié le {new Date(selectedTruck.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur un camion pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalTruck && (
        <TruckModal
          truck={modalTruck}
          onClose={() => setModalTruck(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}