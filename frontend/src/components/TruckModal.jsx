import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createTruck, updateTruck } from "../features/truckSlice";
import { X, Truck, Calendar, Wrench, Hash } from "lucide-react";
import {useSelector} from 'react-redux';

export default function TruckModal({ truck, onClose , onSave }) {
    console.log("le truck", truck);

const { truckStatus } = useSelector((state) => state.trucks);
  const dispatch = useDispatch();
  const [modalTruck, setModalTruck] = useState({
    immatriculation: "",
    kilometrage: "",
    marque: "",
    modele: "",
    statut: "",
    dateAchat: "",
    derniereMaintenance: "",
  });

  useEffect(() => {
    if (truck) {
      setModalTruck(truck);
    }
  }, [truck]);

// TruckModal.jsx
const handleSubmit = () => {
  onSave(modalTruck); // ✅ on passe le truck au parent
  onClose();
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {modalTruck._id ? "Modifier le camion" : "Créer un nouveau camion"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Immatriculation */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Immatriculation *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={modalTruck.immatriculation}
                  onChange={(e) =>
                    setModalTruck({ ...modalTruck, immatriculation: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                  placeholder="Ex: AB-1234-CD"
                />
              </div>
            </div>

            {/* Modèle */}
            <div>
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Modèle *
              </label>
              <input
                type="text"
                value={modalTruck.modele}
                onChange={(e) =>
                  setModalTruck({ ...modalTruck, modele: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                placeholder="Ex: Actros, FH16"
              />
            </div>

            {/* Kilométrage */}
            <div>
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Kilométrage (km) *
              </label>
              <input
                type="number"
                value={modalTruck.kilometrage}
                onChange={(e) =>
                  setModalTruck({ ...modalTruck, kilometrage: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                placeholder="Ex: 150000"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Statut *
              </label>
            <select
            value={modalTruck.statut}
            onChange={(e) =>
                setModalTruck({ ...modalTruck, statut: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition bg-white"
            >
            <option value="">Sélectionner un statut</option>
            {truckStatus.map((status, idx) => (
                <option key={idx} value={status}>{status}</option>
            ))}
            </select>

            </div>

            {/* Date d'achat */}
            <div>
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Date d'achat
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={modalTruck.dateAchat}
                  onChange={(e) =>
                    setModalTruck({ ...modalTruck, dateAchat: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                />
              </div>
            </div>

            {/* Dernière maintenance */}
            <div>
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                Dernière maintenance
              </label>
              <div className="relative">
                <Wrench className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={modalTruck.derniereMaintenance}
                  onChange={(e) =>
                    setModalTruck({ ...modalTruck, derniereMaintenance: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Note informative */}
          <div className="mt-6 p-4 bg-[#3b8492]/10 border border-[#3b8492]/30 rounded-lg">
            <p className="text-sm text-[#2a6570]">
              <span className="font-semibold">Note :</span> Les champs marqués d'un astérisque (*) sont obligatoires.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            {modalTruck._id ? "Enregistrer les modifications" : "Créer le camion"}
          </button>
        </div>
      </div>
    </div>
  );
}