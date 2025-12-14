import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTrips, startTrip, endTrip } from "../features/tripSlice";
import { 
  MapPin, 
  Calendar, 
  Truck as TruckIcon, 
  Clock, 
  CheckCircle, 
  Play, 
  StopCircle,
  Fuel,
  Gauge,
  Download,
  FileText  
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const { list: trips, loading } = useSelector(state => state.trips);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  const [startData, setStartData] = useState({ carburantDepart: "", remarquesVehicule: "" });
  const [endData, setEndData] = useState({ kmArrivee: "", carburantArrivee: "", remarquesVehicule: "" });

  useEffect(() => {
    dispatch(fetchMyTrips());
  }, [dispatch]);

  useEffect(() => {
    if (user?.mustChangePassword) {
      navigate('/change-password');
    }
  }, [user, navigate]);

  const myTrips = trips;

  const handleStartTrip = (trip) => {
    setSelectedTrip(trip);
    setStartData({ carburantDepart: "", remarquesVehicule: trip.remarquesVehicule || "" });
    setShowStartModal(true);
  };

  const handleEndTrip = (trip) => {
    setSelectedTrip(trip);
    setEndData({ kmArrivee: "", carburantArrivee: "", remarquesVehicule: trip.remarquesVehicule || "" });
    setShowEndModal(true);
  };

  const confirmStartTrip = () => {
    //  Vérifier uniquement le carburant
    if (!startData.carburantDepart) {
      alert("Veuillez saisir le carburant de départ");
      return;
    }
    
    dispatch(startTrip({ 
      id: selectedTrip._id, 
      startData: {
        carburantDepart: Number(startData.carburantDepart),
        remarquesVehicule: startData.remarquesVehicule
      }
    }));
    setShowStartModal(false);
    setStartData({ carburantDepart: "", remarquesVehicule: "" });
  };

  const confirmEndTrip = () => {
    if (!endData.kmArrivee || !endData.carburantArrivee) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    dispatch(endTrip({ 
      id: selectedTrip._id, 
      endData: {
        kmArrivee: Number(endData.kmArrivee),
        carburantArrivee: Number(endData.carburantArrivee),
        remarquesVehicule: endData.remarquesVehicule
      }
    }));
    setShowEndModal(false);
    setEndData({ kmArrivee: "", carburantArrivee: "", remarquesVehicule: "" });
  };

  const downloadPDF = async (tripId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/trips/${tripId}/download-pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordre-mission-${tripId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erreur lors du téléchargement du PDF");
      console.error(err);
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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#2a6570] mb-2">
            Mes Trajets
          </h1>
          <p className="text-gray-600">
            Bonjour <span className="font-semibold">{user?.name}</span>, voici vos trajets assignés
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">À faire</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {myTrips.filter(t => t.status === "a-faire").length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">En cours</p>
                <p className="text-3xl font-bold text-blue-600">
                  {myTrips.filter(t => t.status === "en-cours").length}
                </p>
              </div>
              <Play className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Terminés</p>
                <p className="text-3xl font-bold text-green-600">
                  {myTrips.filter(t => t.status === "termine").length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Trips List */}
        <div className="grid grid-cols-1 gap-6">
          {myTrips.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Aucun trajet assigné pour le moment</p>
            </div>
          ) : (
            myTrips.map(trip => (
              <div key={trip._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-[#2a6570]">
                          {trip.lieuDepart} → {trip.lieuArrivee}
                        </h3>
                        {getStatusBadge(trip.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#3b8492]" />
                          <span>Type: <span className="font-semibold">{trip.type}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-[#3b8492]" />
                          <span>Départ: <span className="font-semibold">
                            {new Date(trip.datDepart).toLocaleDateString('fr-FR')}
                          </span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TruckIcon className="w-5 h-5 text-[#3b8492]" />
                          <span>Camion: <span className="font-semibold">
                            {trip.truck?.immatriculation}
                          </span></span>
                        </div>
                        {trip.trailer && (
                          <div className="flex items-center gap-2">
                            <TruckIcon className="w-5 h-5 text-[#3b8492]" />
                            <span>Remorque: <span className="font-semibold">
                              {trip.trailer?.plateNumber}
                            </span></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4 flex-col">
                      {/*  Bouton télécharger PDF */}
                      <button
                        onClick={() => downloadPDF(trip._id)}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                      >
                        <Download className="w-5 h-5" />
                        Télécharger PDF
                      </button>

                      {trip.status === "a-faire" && (
                        <button
                          onClick={() => handleStartTrip(trip)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                          <Play className="w-5 h-5" />
                          Démarrer
                        </button>
                      )}
                      {trip.status === "en-cours" && (
                        <button
                          onClick={() => handleEndTrip(trip)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                          <StopCircle className="w-5 h-5" />
                          Terminer
                        </button>
                      )}
                    </div>
                  </div>

                  {/*  Afficher les remarques si présentes */}
                  {trip.remarquesVehicule && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-800">Remarques sur le véhicule :</p>
                          <p className="text-sm text-yellow-700 mt-1">{trip.remarquesVehicule}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trip Details if started */}
                  {trip.status !== "a-faire" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {trip.kmDepart && (
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-gray-500" />
                          <span>KM départ: <strong>{trip.kmDepart}</strong></span>
                        </div>
                      )}
                      {trip.carburantDepart && (
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-gray-500" />
                          <span>Carburant départ: <strong>{trip.carburantDepart}L</strong></span>
                        </div>
                      )}
                      {trip.kmArrivee && (
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-gray-500" />
                          <span>KM arrivée: <strong>{trip.kmArrivee}</strong></span>
                        </div>
                      )}
                      {trip.carburantArrivee && (
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-gray-500" />
                          <span>Carburant arrivée: <strong>{trip.carburantArrivee}L</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Start Trip Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white">Démarrer le trajet</h2>
              <p className="text-blue-100 text-sm mt-1">
                Le kilométrage de départ sera récupéré automatiquement du camion
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/*  Afficher le kilométrage du camion (lecture seule) */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">
                    Kilométrage actuel du camion
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-900 ml-7">
                  {selectedTrip?.truck?.kilometrage || 'N/A'} km
                </p>
                <p className="text-xs text-blue-600 ml-7 mt-1">
                  Ce kilométrage sera utilisé comme point de départ
                </p>
              </div>

              {/* Carburant de départ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Fuel className="inline w-4 h-4 mr-1" />
                  Carburant de départ (L) *
                </label>
                <input
                  type="number"
                  value={startData.carburantDepart}
                  onChange={e => setStartData({...startData, carburantDepart: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 100"
                />
              </div>

              {/* Remarques sur le véhicule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Remarques sur l'état du véhicule
                </label>
                <textarea
                  value={startData.remarquesVehicule}
                  onChange={e => setStartData({...startData, remarquesVehicule: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ex: Pneu avant gauche légèrement usé..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowStartModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmStartTrip}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Trip Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white">Terminer le trajet</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Gauge className="inline w-4 h-4 mr-1" />
                  Kilométrage d'arrivée *
                </label>
                <input
                  type="number"
                  value={endData.kmArrivee}
                  onChange={e => setEndData({...endData, kmArrivee: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 50500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Fuel className="inline w-4 h-4 mr-1" />
                  Carburant d'arrivée (L) *
                </label>
                <input
                  type="number"
                  value={endData.carburantArrivee}
                  onChange={e => setEndData({...endData, carburantArrivee: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 50"
                />
              </div>
              {/*  Champ remarques */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Remarques sur l'état du véhicule
                </label>
                <textarea
                  value={endData.remarquesVehicule}
                  onChange={e => setEndData({...endData, remarquesVehicule: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Ex: Petit accrochage côté droit..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmEndTrip}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
