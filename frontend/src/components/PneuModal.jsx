import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrucks } from "../features/truckSlice";
import { fetchTrailers } from "../features/trailerSlice";

export default function PneuModal({ pneu, onClose, onSave }) {
  const dispatch = useDispatch();
  
  const { list: trucks } = useSelector(state => state.trucks);
  const { list: trailers } = useSelector(state => state.trailers);

  const [modalPneu, setModalPneu] = useState({
    position: "",
    usurePourcentage: 0,
    truck: "",
    trailer: "",
    status: "disponible",
    marque: "",
    dateInstallation: "",
    lastMaintenance: "",
  });

  useEffect(() => {
    dispatch(fetchTrucks());
    dispatch(fetchTrailers());
  }, [dispatch]);

  useEffect(() => {
    if (pneu) {
      setModalPneu({
        ...pneu,
        truck: pneu.truck?._id || pneu.truck || "",
        trailer: pneu.trailer?._id || pneu.trailer || "",
        dateInstallation: pneu.dateInstallation ? new Date(pneu.dateInstallation).toISOString().split('T')[0] : "",
        lastMaintenance: pneu.lastMaintenance ? new Date(pneu.lastMaintenance).toISOString().split('T')[0] : "",
      });
    }
  }, [pneu]);

  const handleSubmit = () => {
    if (!modalPneu.position || !modalPneu.marque) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const dataToSave = {
      ...modalPneu,
      truck: modalPneu.truck || null,
      trailer: modalPneu.trailer || null,
    };

    onSave(dataToSave);
    onClose();
  };

  const handleVehicleChange = (type, value) => {
    if (type === 'truck') {
      setModalPneu({ ...modalPneu, truck: value, trailer: "" });
    } else {
      setModalPneu({ ...modalPneu, trailer: value, truck: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{modalPneu._id ? "Modifier le pneu" : "Créer un pneu"}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Position *</label>
            <select 
              value={modalPneu.position} 
              onChange={e => setModalPneu({...modalPneu, position: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="">Sélectionner une position</option>
              <option value="avant gauche">Avant gauche</option>
              <option value="avant droite">Avant droite</option>
              <option value="arriere gauche">Arrière gauche</option>
              <option value="arriere droite">Arrière droite</option>
            </select>
          </div>

          {/* Marque */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Marque *</label>
            <input 
              type="text" 
              value={modalPneu.marque} 
              onChange={e => setModalPneu({...modalPneu, marque: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Ex: Michelin"
            />
          </div>

          {/* Usure */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Usure (%)</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={modalPneu.usurePourcentage} 
              onChange={e => setModalPneu({...modalPneu, usurePourcentage: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Statut</label>
            <select 
              value={modalPneu.status} 
              onChange={e => setModalPneu({...modalPneu, status: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="disponible">Disponible</option>
              <option value="en_mission">En mission</option>
              <option value="en_maintenance">En maintenance</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Camion 🚛
            </label>
            <select 
              value={modalPneu.truck} 
              onChange={e => handleVehicleChange('truck', e.target.value)}
              disabled={modalPneu.trailer} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Aucun camion</option>
              {trucks.map(truck => (
                <option key={truck._id} value={truck._id}>
                  {truck.immatriculation} - {truck.marque} {truck.modele}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Remorque 🚚
            </label>
            <select 
              value={modalPneu.trailer} 
              onChange={e => handleVehicleChange('trailer', e.target.value)}
              disabled={modalPneu.truck} // Désactiver si truck sélectionné
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Aucune remorque</option>
              {trailers.map(trailer => (
                <option key={trailer._id} value={trailer._id}>
                  {trailer.plateNumber} - {trailer.type}
                </option>
              ))}
            </select>
          </div>

          {/* Date installation */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Date installation</label>
            <input 
              type="date" 
              value={modalPneu.dateInstallation} 
              onChange={e => setModalPneu({...modalPneu, dateInstallation: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
            />
          </div>

          {/* Dernière maintenance */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Dernière maintenance</label>
            <input 
              type="date" 
              value={modalPneu.lastMaintenance} 
              onChange={e => setModalPneu({...modalPneu, lastMaintenance: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
            />
          </div>

          {/* Note d'information */}
          <div className="md:col-span-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <b>⚠️ Important :</b> Un pneu ne peut être assigné qu'à <b>un seul véhicule</b> (camion OU remorque, pas les deux).
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition">Annuler</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition">{modalPneu._id ? "Enregistrer" : "Créer"}</button>
        </div>
      </div>
    </div>
  );
}
