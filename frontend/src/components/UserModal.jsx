import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function UserModal({ user, onClose, onSave }) {
  // ✅ Initialisation sûre avec des chaînes vides
  const [modalUser, setModalUser] = useState({
    name: "",
    email: "",
    _id: null,
  });

  // Met à jour modalUser quand user change
  useEffect(() => {
    setModalUser({
      name: user?.name || "",
      email: user?.email || "",
      _id: user?._id || null,
    });
  }, [user]);

  const handleSubmit = () => {
    onSave(modalUser);
    // Le modal se ferme côté parent après la sauvegarde
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {modalUser._id ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Nom *</label>
            <input
              type="text"
              value={modalUser.name || ""}
              onChange={e => setModalUser({ ...modalUser, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Email *</label>
            <input
              type="email"
              value={modalUser.email || ""}
              onChange={e => setModalUser({ ...modalUser, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition"
          >
            {modalUser._id ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
