import React, { useState, useEffect } from "react";
import { X, Upload, DollarSign } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrips } from "../features/tripSlice"; 

export default function FuelLogModal({ fuelLog, onClose, onSave }) {
  const dispatch = useDispatch();
  
  const { list: trips } = useSelector(state => state.trips);

  const [modalFuelLog, setModalFuelLog] = useState({
    trip: "",
    montant: 0,
    facture: null,
  });

  const [fileName, setFileName] = useState("");

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  useEffect(() => {
    if (fuelLog) {
      setModalFuelLog({
        ...fuelLog,
        trip: fuelLog.trip?._id || fuelLog.trip || "",
        facture: null,
      });
    }
  }, [fuelLog]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModalFuelLog({ ...modalFuelLog, facture: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    if (!modalFuelLog.trip || !modalFuelLog.montant) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    onSave(modalFuelLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {fuelLog?._id ? "Détails du carburant" : "Ajouter un log de carburant"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Trip (Trajet) */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Trajet associé *
            </label>
            <select 
              value={modalFuelLog.trip} 
              onChange={e => setModalFuelLog({...modalFuelLog, trip: e.target.value})}
              disabled={fuelLog?._id}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] disabled:bg-gray-100"
            >
              <option value="">Sélectionner un trajet</option>
              {trips.map(trip => (
                <option key={trip._id} value={trip._id}>
                  {trip.lieuDepart} → {trip.lieuArrivee} | {new Date(trip.datDepart).toLocaleDateString()} | {trip.status}
                </option>
              ))}
            </select>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Montant (MAD) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="number" 
                min="0" 
                step="0.01"
                value={modalFuelLog.montant} 
                onChange={e => setModalFuelLog({...modalFuelLog, montant: parseFloat(e.target.value)})}
                disabled={fuelLog?._id}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] disabled:bg-gray-100"
                placeholder="Ex: 500.00"
              />
            </div>
          </div>

          {/* Upload Facture */}
          {!fuelLog?._id && (
            <div>
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Facture (Image ou PDF)
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="facture-upload"
                />
                <label 
                  htmlFor="facture-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3b8492] transition"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {fileName || "Cliquer pour choisir un fichier"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Afficher la facture si elle existe */}
          {fuelLog?.factureUrl && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 mb-2">Facture attachée :</p>
              {fuelLog.factureType === "pdf" ? (
                <a 
                  href={`http://localhost:3000${fuelLog.factureUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  📄 Voir le PDF
                </a>
              ) : (
                <img 
                  src={`http://localhost:3000${fuelLog.factureUrl}`} 
                  alt="Facture" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {fuelLog?._id ? "Fermer" : "Annuler"}
          </button>
          {!fuelLog?._id && (
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition"
            >
              Enregistrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}