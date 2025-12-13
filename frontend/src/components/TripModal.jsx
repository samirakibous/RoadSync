import React, { useState, useEffect } from "react";
import { X, MapPin, Calendar, Truck as TruckIcon, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrucks } from "../features/truckSlice";
import { fetchTrailers } from "../features/trailerSlice";
import { fetchUsers } from "../features/userSlice";

export default function TripModal({ trip, onClose, onSave }) {
  const dispatch = useDispatch();
  
  const { list: trucks } = useSelector(state => state.trucks);
  const { list: trailers } = useSelector(state => state.trailers);
  const { list: users } = useSelector(state => state.users);

  const [modalTrip, setModalTrip] = useState({
    lieuDepart: "",
    lieuArrivee: "",
    datDepart: "",
    datArrivee: "",
    distance: 0,
    truck: "",
    trailer: "",
    driver: "",
    type: "livraison",
    status: "a-faire",
  });

  useEffect(() => {
    dispatch(fetchTrucks());
    dispatch(fetchTrailers());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (trip) {
      setModalTrip({
        ...trip,
        truck: trip.truck?._id || trip.truck || "",
        trailer: trip.trailer?._id || trip.trailer || "",
        driver: trip.driver?._id || trip.driver || "",
        datDepart: trip.datDepart ? new Date(trip.datDepart).toISOString().split('T')[0] : "",
        datArrivee: trip.datArrivee ? new Date(trip.datArrivee).toISOString().split('T')[0] : "",
      });
    }
  }, [trip]);

  const handleSubmit = () => {
    if (!modalTrip.lieuDepart || !modalTrip.lieuArrivee || !modalTrip.datDepart || !modalTrip.truck || !modalTrip.driver) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    onSave(modalTrip);
    onClose();
  };

  // Filtrer uniquement les chauffeurs
  const drivers = users.filter(user => user.role === "driver");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {modalTrip._id ? "Modifier le trajet" : "Créer un trajet"}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lieu de départ */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Lieu de départ *
            </label>
            <input 
              type="text" 
              value={modalTrip.lieuDepart} 
              onChange={e => setModalTrip({...modalTrip, lieuDepart: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Ex: Casablanca"
            />
          </div>

          {/* Lieu d'arrivée */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Lieu d'arrivée *
            </label>
            <input 
              type="text" 
              value={modalTrip.lieuArrivee} 
              onChange={e => setModalTrip({...modalTrip, lieuArrivee: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Ex: Marrakech"
            />
          </div>

          {/* Date de départ */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date de départ *
            </label>
            <input 
              type="date" 
              value={modalTrip.datDepart} 
              onChange={e => setModalTrip({...modalTrip, datDepart: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
            />
          </div>

          {/* Date d'arrivée */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date d'arrivée prévue
            </label>
            <input 
              type="date" 
              value={modalTrip.datArrivee} 
              onChange={e => setModalTrip({...modalTrip, dateArrivee: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Type de trajet</label>
            <select 
              value={modalTrip.type} 
              onChange={e => setModalTrip({...modalTrip, type: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="livraison">Livraison</option>
              <option value="transport">Transport</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          {/* Camion */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <TruckIcon className="inline w-4 h-4 mr-1" />
              Camion *
            </label>
            <select 
              value={modalTrip.truck} 
              onChange={e => setModalTrip({...modalTrip, truck: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="">Sélectionner un camion</option>
              {trucks.map(truck => (
                <option key={truck._id} value={truck._id}>
                  {truck.immatriculation} - {truck.marque} {truck.modele}
                </option>
              ))}
            </select>
          </div>

          {/* Remorque */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Remorque (optionnel)
            </label>
            <select 
              value={modalTrip.trailer} 
              onChange={e => setModalTrip({...modalTrip, trailer: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="">Aucune remorque</option>
              {trailers.map(trailer => (
                <option key={trailer._id} value={trailer._id}>
                  {trailer.plateNumber} - {trailer.type}
                </option>
              ))}
            </select>
          </div>

          {/* Chauffeur */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Chauffeur *
            </label>
            <select 
              value={modalTrip.driver} 
              onChange={e => setModalTrip({...modalTrip, driver: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="">Sélectionner un chauffeur</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.email}
                </option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Statut</label>
            <select 
              value={modalTrip.status} 
              onChange={e => setModalTrip({...modalTrip, status: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="a-faire">À faire</option>
              <option value="en-cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition">
            {modalTrip._id ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
