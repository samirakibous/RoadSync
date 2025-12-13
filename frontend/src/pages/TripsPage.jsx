import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrips, selectTrip, deleteTrip, updateTrip, createTrip } from "../features/tripSlice";
import Sidebare from "../components/sidebare";
import TripModal from "../components/TripModal";
import { MapPin, Calendar, Truck as TruckIcon } from "lucide-react";

export default function TripsPage() {
  const dispatch = useDispatch();
  const { list, selectedTrip, loading, error } = useSelector(state => state.trips);
  const [modalTrip, setModalTrip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchTrips()); 
  }, [dispatch]);

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
    if (window.confirm("Supprimer ce trajet ?")) {
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
    const styles = {
      "a-faire": "bg-yellow-100 text-yellow-800",
      "en-cours": "bg-blue-100 text-blue-800",
      "termine": "bg-green-100 text-green-800"
    };
    const labels = {
      "a-faire": "À faire",
      "en-cours": "En cours",
      "termine": "Terminé"
    };
    return (
      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="flex gap-6 min-h-screen p-6 bg-gray-50">
      <Sidebare />

      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-[#2a6570]">Liste des trajets</h2>
          <button 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" 
            onClick={() => setModalTrip({})}
            disabled={isSubmitting}
          >
            + Ajouter
          </button>
        </div>

        {loading && list.length === 0 && <p className="p-4 text-gray-500">Chargement des trajets...</p>}
        
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
                <th className="p-3">Trajet</th>
                <th className="p-3">Date départ</th>
                <th className="p-3">Camion</th>
                <th className="p-3">Chauffeur</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(trip => (
                <tr 
                  key={trip._id} 
                  className="border-b hover:bg-[#f0f9fa] cursor-pointer" 
                  onClick={() => dispatch(selectTrip(trip))}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#3b8492]" />
                      <div>
                        <div className="font-semibold">{trip.lieuDepart} → {trip.lieuArrivee}</div>
                        <div className="text-xs text-gray-500">{trip.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(trip.datDepart).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <TruckIcon className="w-4 h-4 text-gray-400" />
                      <span>{trip.truck?.immatriculation || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-3">{trip.driver?.name || 'N/A'}</td>
                  <td className="p-3">{getStatusBadge(trip.status)}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); setModalTrip(trip); }}
                      disabled={isSubmitting}
                    >
                      Modifier
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); handleDelete(trip._id); }}
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
        {selectedTrip ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4">Détails du trajet</h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Trajet</p>
                <p className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3b8492]" />
                  {selectedTrip.lieuDepart} → {selectedTrip.lieuArrivee}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Date départ</p>
                  <p className="font-semibold">{new Date(selectedTrip.datDepart).toLocaleDateString()}</p>
                </div>
                {selectedTrip.datArrivee && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Date arrivée</p>
                    <p className="font-semibold">{new Date(selectedTrip.datArrivee).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Véhicules</p>
                <p><b>🚛 Camion :</b> {selectedTrip.truck?.immatriculation} ({selectedTrip.truck?.marque})</p>
                {selectedTrip.trailer && (
                  <p><b>🚚 Remorque :</b> {selectedTrip.trailer?.plateNumber}</p>
                )}
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Chauffeur</p>
                <p className="font-semibold">{selectedTrip.driver?.name}</p>
                <p className="text-sm text-gray-500">{selectedTrip.driver?.email}</p>
              </div>

              <div>
                <p><b>Type :</b> {selectedTrip.type}</p>
                <p><b>Statut :</b> {getStatusBadge(selectedTrip.status)}</p>
              </div>

              <div className="text-xs text-gray-500 pt-3 border-t">
                <p>Créé le : {new Date(selectedTrip.createdAt).toLocaleString()}</p>
                <p>Modifié le : {new Date(selectedTrip.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </>
        ) : <p className="text-gray-500">Sélectionnez un trajet pour voir les détails</p>}
      </div>

      {modalTrip && <TripModal trip={modalTrip} onClose={() => setModalTrip(null)} onSave={handleSave} />}
    </div>
  );
}
