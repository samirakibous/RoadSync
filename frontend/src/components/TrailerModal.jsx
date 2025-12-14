import React, { useEffect, useState } from "react";
import { X, Hash, Calendar, Wrench } from "lucide-react";

export default function TrailerModal({ trailer, onClose, onSave, trailerStatus }) {
 const [modalTrailer, setModalTrailer] = useState({
  plateNumber: "",      
  type: "",
  status: "",     
  maxLoad: "",  
  purchaseDate: "", 
  lastMaintenance: "",
});

  useEffect(() => {
    if (trailer) setModalTrailer(trailer);
  }, [trailer]);

  const handleSubmit = () => {
    if (!modalTrailer.plateNumber || !modalTrailer.type) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    onSave(modalTrailer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{modalTrailer._id ? "Modifier la remorque" : "Créer une nouvelle remorque"}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Immatriculation */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Immatriculation *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" value={modalTrailer.plateNumber} onChange={(e)=>setModalTrailer({...modalTrailer, plateNumber:e.target.value})} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Type *</label>
            <input type="text" value={modalTrailer.type} onChange={(e)=>setModalTrailer({...modalTrailer, type:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Statut</label>
            <select value={modalTrailer.status} onChange={(e)=>setModalTrailer({...modalTrailer, status:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]">
              <option value="">Sélectionner un statut</option>
              {trailerStatus.map((s,i)=><option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Maximum poids */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Maximum poids</label>
            <input type="text" value={modalTrailer.maxLoad} onChange={(e)=>setModalTrailer({...modalTrailer, maxLoad:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" />
          </div>

          {/* Date d'achat */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Date d'achat</label>
            <input type="date" value={modalTrailer.dateAchat||""} onChange={(e)=>setModalTrailer({...modalTrailer, purchaseDate:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" />
          </div>

          {/* Dernière maintenance */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Dernière maintenance</label>
            <input type="date" value={modalTrailer.derniereMaintenance||""} onChange={(e)=>setModalTrailer({...modalTrailer, lastMaintenance:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition">Annuler</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition">{modalTrailer._id ? "Enregistrer" : "Créer"}</button>
        </div>
      </div>
    </div>
  );
}
