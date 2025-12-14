import React, { useState, useEffect } from "react";
import { X, Settings, Calendar, Gauge } from "lucide-react";
import { useSelector } from "react-redux";

export default function MaintenanceRuleModal({ rule, onClose, onSave }) {
  const { types, actions } = useSelector(state => state.maintenanceRules);

  const [modalRule, setModalRule] = useState({
    type: "",
    action: "",
    intervalKm: 0,
    intervalDays: 0,
    description: "",
    active: true,
  });

  useEffect(() => {
    if (rule && rule._id) {
      setModalRule(rule);
    }
  }, [rule]);

  const handleSubmit = () => {
    if (!modalRule.type || !modalRule.action) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (modalRule.intervalKm === 0 && modalRule.intervalDays === 0) {
      alert("Veuillez définir au moins un intervalle (km ou jours).");
      return;
    }

    onSave(modalRule);
    onClose();
  };

  const getActionLabel = (action) => {
    const labels = {
      vidange: "Vidange",
      revision: "Révision",
      changement_pneu: "Changement de pneu",
      controle_securite: "Contrôle de sécurité",
      autre: "Autre"
    };
    return labels[action] || action;
  };

  const getTypeLabel = (type) => {
    const labels = {
      truck: "Camion",
      trailer: "Remorque",
      pneu: "Pneu"
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {modalRule._id ? "Modifier la règle" : "Créer une règle de maintenance"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type de ressource */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Type de ressource *</label>
            <select 
              value={modalRule.type} 
              onChange={e => setModalRule({...modalRule, type: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="">Sélectionner un type</option>
              {types.map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Action *</label>
            <select 
              value={modalRule.action} 
              onChange={e => setModalRule({...modalRule, action: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
            >
              <option value="">Sélectionner une action</option>
              {actions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>

          {/* Intervalle KM */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <Gauge className="inline w-4 h-4 mr-1" />
              Intervalle (km)
            </label>
            <input 
              type="number" 
              min="0" 
              value={modalRule.intervalKm} 
              onChange={e => setModalRule({...modalRule, intervalKm: parseInt(e.target.value) || 0})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Ex: 10000"
            />
          </div>

          {/* Intervalle Jours */}
          <div>
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Intervalle (jours)
            </label>
            <input 
              type="number" 
              min="0" 
              value={modalRule.intervalDays} 
              onChange={e => setModalRule({...modalRule, intervalDays: parseInt(e.target.value) || 0})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Ex: 365"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Description</label>
            <textarea 
              rows="3"
              value={modalRule.description} 
              onChange={e => setModalRule({...modalRule, description: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Détails supplémentaires..."
            />
          </div>

          {/* Active */}
          <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input 
              type="checkbox" 
              id="active"
              checked={modalRule.active} 
              onChange={e => setModalRule({...modalRule, active: e.target.checked})} 
              className="w-5 h-5 text-[#3b8492] focus:ring-2 focus:ring-[#3b8492] rounded"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
              Règle active (les notifications seront envoyées)
            </label>
          </div>

          {/* Note d'information */}
          <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <b>ℹ️ Information :</b> Définissez au moins un intervalle (km ou jours) pour que la règle soit fonctionnelle.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#3b8492] hover:bg-[#2a6570] text-white rounded-lg font-semibold transition">
            {modalRule._id ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}