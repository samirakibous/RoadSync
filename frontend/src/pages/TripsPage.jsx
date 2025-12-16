import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchTrips, 
  deleteTrip, 
  selectTrip, 
  createTrip, 
  updateTrip 
} from "../features/tripSlice";
import { fetchFuelLogsByTrip } from "../features/fuelLogSlice";
import { 
  MapPin, 
  Calendar, 
  Truck,
  Gauge,
  FileText,
  DollarSign,
  Receipt,
  Plus,
  Edit2,
  Trash2,
  Info,
  AlertCircle,
  User,
  Navigation,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import Sidebare from "../components/sidebare";
import TripModal from "../components/TripModal";

export default function TripsPage() {
  const dispatch = useDispatch();
  const { list, selectedTrip, loading, error } = useSelector(state => state.trips);
  const { list: fuelLogs, loading: fuelLogsLoading } = useSelector(state => state.fuelLog);
  const [modalTrip, setModalTrip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchTrips()); 
  }, [dispatch]);

  useEffect(() => {
    if (selectedTrip?._id) {
      dispatch(fetchFuelLogsByTrip(selectedTrip._id));
    }
  }, [selectedTrip, dispatch]);

  const handleSave = async (trip) => {
    setIsSubmitting(true);
    try {
      if (trip._id) {
        await dispatch(updateTrip({ id: trip._id, tripData: trip })).unwrap();
      } else {
        await dispatch(createTrip(trip)).unwrap();
      }
      await dispatch(fetchTrips()).unwrap();
      setModalTrip(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) {
      setIsSubmitting(true);
      try {
        await dispatch(deleteTrip(tripId)).unwrap();
        await dispatch(fetchTrips()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "a-faire": { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'À faire', icon: Clock },
      "en-cours": { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', label: 'En cours', icon: Navigation },
      "termine": { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig["a-faire"];
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
        {/* TABLEAU DES TRAJETS */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Gestion des trajets</h2>
                <p className="text-sm text-gray-500">{list.length} trajet(s) enregistré(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              onClick={() => setModalTrip({})}
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              Ajouter un trajet
            </button>
          </div>

          {/* Loading & Error */}
          {loading && list.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des trajets...</p>
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
                      Trajet
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date départ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Camion
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Chauffeur
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
                  {list.map(trip => (
                    <tr 
                      key={trip._id} 
                      className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                      onClick={() => dispatch(selectTrip(trip))}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#3b8492] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">{trip.lieuDepart} → {trip.lieuArrivee}</p>
                            <p className="text-xs text-gray-500">{trip.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{new Date(trip.datDepart).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#3b8492]" />
                          <span className="text-sm font-medium text-gray-900">{trip.truck?.immatriculation || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{trip.driver?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-[#3b8492]/10 text-[#3b8492] rounded-lg hover:bg-[#3b8492]/20 transition disabled:opacity-50"
                            onClick={e => { e.stopPropagation(); setModalTrip(trip); }}
                            disabled={isSubmitting}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            onClick={e => { e.stopPropagation(); handleDelete(trip._id); }}
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
                    <Navigation className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucun trajet enregistré</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre premier trajet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DU TRAJET */}
        <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto max-h-[calc(100vh-120px)]">
          <div className="px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#2a6570]">Détails</h2>
            </div>
          </div>

          <div className="p-6">
            {selectedTrip ? (
              <div className="space-y-4">
                {/* Trajet */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-6 h-6 text-[#3b8492] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#2a6570] uppercase mb-1">Trajet</p>
                      <p className="text-lg font-bold text-[#2a6570]">
                        {selectedTrip.lieuDepart} → {selectedTrip.lieuArrivee}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{selectedTrip.type}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date départ</p>
                    <p className="font-semibold text-gray-900 text-sm">{new Date(selectedTrip.datDepart).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {selectedTrip.dateArrivee && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date arrivée</p>
                      <p className="font-semibold text-gray-900 text-sm">{new Date(selectedTrip.dateArrivee).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>

                {/* Statut */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Statut</p>
                  {getStatusBadge(selectedTrip.status)}
                </div>

                {/* Véhicules */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-[#3b8492]" />
                    <p className="font-semibold text-[#2a6570]">Véhicules</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Camion:</span> <span className="font-medium">{selectedTrip.truck?.immatriculation}</span> ({selectedTrip.truck?.marque})</p>
                    {selectedTrip.trailer && (
                      <p><span className="text-gray-500">Remorque:</span> <span className="font-medium">{selectedTrip.trailer?.plateNumber}</span></p>
                    )}
                  </div>
                </div>

                {/* Chauffeur */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Chauffeur</p>
                      <p className="font-semibold text-gray-900">{selectedTrip.driver?.name}</p>
                      <p className="text-sm text-gray-600">{selectedTrip.driver?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Relevés du trajet */}
                {(selectedTrip.kmDepart || selectedTrip.kmArrivee || selectedTrip.carburantDepart || selectedTrip.carburantArrivee) && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Gauge className="w-5 h-5 text-[#3b8492]" />
                      <h3 className="text-sm font-semibold text-[#2a6570]">Relevés du trajet</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTrip.kmDepart && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">KM départ</p>
                          <p className="font-bold text-blue-700">{selectedTrip.kmDepart.toLocaleString()} km</p>
                        </div>
                      )}
                      {selectedTrip.kmArrivee && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600">KM arrivée</p>
                          <p className="font-bold text-green-700">{selectedTrip.kmArrivee.toLocaleString()} km</p>
                        </div>
                      )}
                      {selectedTrip.carburantDepart && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-gray-600">Carburant départ</p>
                          <p className="font-bold text-yellow-700">{selectedTrip.carburantDepart} L</p>
                        </div>
                      )}
                      {selectedTrip.carburantArrivee && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs text-gray-600">Carburant arrivée</p>
                          <p className="font-bold text-orange-700">{selectedTrip.carburantArrivee} L</p>
                        </div>
                      )}
                    </div>

                    {/* Calculs */}
                    {selectedTrip.kmDepart && selectedTrip.kmArrivee && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                          <Navigation className="w-4 h-4" />
                          Distance: {(selectedTrip.kmArrivee - selectedTrip.kmDepart).toLocaleString()} km
                        </p>
                        {selectedTrip.carburantDepart && selectedTrip.carburantArrivee && (
                          <p className="text-sm font-semibold text-purple-800 mt-1 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Consommation: {selectedTrip.carburantDepart - selectedTrip.carburantArrivee} L
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Fuel Logs */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Receipt className="w-5 h-5 text-[#3b8492]" />
                    <h3 className="text-sm font-semibold text-[#2a6570]">Fuel Logs ({fuelLogs.length})</h3>
                  </div>
                  
                  {fuelLogsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : fuelLogs.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg">Aucun fuel log pour ce trajet</p>
                  ) : (
                    <div className="space-y-2">
                      {fuelLogs.map((log) => (
                        <div key={log._id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <p className="font-bold text-green-800 text-lg">{log.montant} MAD</p>
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleDateString('fr-FR')} à {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {log.factureUrl && (
                            <div className="mt-2">
                              {log.factureType === 'pdf' ? (
                                <a 
                                  href={`http://localhost:3000${log.factureUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                  <FileText className="w-3 h-3" />
                                  Voir le PDF
                                </a>
                              ) : (
                                <a 
                                  href={`http://localhost:3000${log.factureUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <img 
                                    src={`http://localhost:3000${log.factureUrl}`} 
                                    alt="Facture" 
                                    className="w-full h-24 object-cover rounded border border-green-300 hover:opacity-80 transition"
                                  />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Total des fuel logs */}
                      <div className="mt-3 p-3 bg-green-100 rounded-lg border-2 border-green-300">
                        <p className="text-sm font-bold text-green-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Total carburant: {fuelLogs.reduce((sum, log) => sum + (log.montant || 0), 0).toFixed(2)} MAD
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remarques sur le véhicule */}
                {selectedTrip.remarquesVehicule && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-800 mb-1">Remarques sur le véhicule</p>
                          <p className="text-sm text-yellow-700">{selectedTrip.remarquesVehicule}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes générales */}
                {selectedTrip.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{selectedTrip.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="pt-4 border-t border-gray-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Créé le {new Date(selectedTrip.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedTrip.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Modifié le {new Date(selectedTrip.updatedAt).toLocaleDateString('fr-FR')} à {new Date(selectedTrip.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur un trajet pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalTrip && (
        <TripModal 
          trip={modalTrip} 
          onClose={() => setModalTrip(null)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}