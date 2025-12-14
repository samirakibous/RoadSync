import React, { useState, useEffect } from "react";
import { X, Wrench, Truck as TruckIcon, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrucks } from "../features/truckSlice";
import { fetchTrailers } from "../features/trailerSlice";
import { fetchPneus } from "../features/pneuSlice";
import { fetchMaintenanceRules } from "../features/maintenanceRuleSlice";

export default function MaintenanceModal({ maintenance, onClose, onSave }) {
  const dispatch = useDispatch();
  
  const { list: trucks } = useSelector(state => state.trucks);
  const { list: trailers } = useSelector(state => state.trailers);
  const { list: pneus } = useSelector(state => state.pneus);
  const { list: rules } = useSelector(state => state.maintenanceRules);

  const [modalMaintenance, setModalMaintenance] = useState({
    resourceType: "",
    truck: "",
    trailer: "",
    pneu: "",
    rule: "",
    notes: "",
    kmAtMaintenance: 0,
  });

  useEffect(() => {
    dispatch(fetchTrucks());
    dispatch(fetchTrailers());
    dispatch(fetchPneus());
    dispatch(fetchMaintenanceRules());
  }, [dispatch]);

  useEffect(() => {
    if (maintenance && maintenance._id) {
      const resourceId = maintenance.resource?._id || maintenance.resource || "";
      
      setModalMaintenance({
        ...maintenance,
        truck: maintenance.resourceType === "truck" ? resourceId : "",
        trailer: maintenance.resourceType === "trailer" ? resourceId : "",
        pneu: maintenance.resourceType === "pneu" ? resourceId : "",
        rule: maintenance.rule?._id || maintenance.rule || "",
        kmAtMaintenance: maintenance.kmAtMaintenance || 0,
      });
    }
  }, [maintenance]);

  const handleSubmit = () => {
    if (!modalMaintenance.resourceType) {
      alert("Veuillez sélectionner un type de ressource.");
      return;
    }

    if (!modalMaintenance.truck && !modalMaintenance.trailer && !modalMaintenance.pneu) {
      alert("Veuillez sélectionner une ressource (camion, remorque ou pneu).");
      return;
    }

    if (!modalMaintenance.rule) {
      alert("Veuillez sélectionner une règle de maintenance.");
      return;
    }

    // Mapper vers le format backend avec 'resource'
    let resource;
    if (modalMaintenance.resourceType === "truck") {
      resource = modalMaintenance.truck;
    } else if (modalMaintenance.resourceType === "trailer") {
      resource = modalMaintenance.trailer;
    } else if (modalMaintenance.resourceType === "pneu") {
      resource = modalMaintenance.pneu;
    }

    const dataToSave = {
      resourceType: modalMaintenance.resourceType,
      resource: resource,
      rule: modalMaintenance.rule,
      notes: modalMaintenance.notes || "",
      kmAtMaintenance: modalMaintenance.kmAtMaintenance || 0,
    };

    if (modalMaintenance._id) {
      dataToSave._id = modalMaintenance._id;
    }

    onSave(dataToSave);
    onClose();
  }; // ✅ Ajout de l'accolade fermante manquante

  const handleResourceTypeChange = (type) => {
    setModalMaintenance({
      ...modalMaintenance,
      resourceType: type,
      truck: "",
      trailer: "",
      pneu: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-[#3b8492] to-[#2a6570] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {modalMaintenance._id ? "Modifier la maintenance" : "Créer une maintenance"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type de ressource */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">Type de ressource *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleResourceTypeChange("truck")}
                className={`px-4 py-3 rounded-lg border-2 transition ${
                  modalMaintenance.resourceType === "truck"
                    ? "border-[#3b8492] bg-[#3b8492] text-white"
                    : "border-gray-200 hover:border-[#3b8492]"
                }`}
              >
                🚛 Camion
              </button>
              <button
                type="button"
                onClick={() => handleResourceTypeChange("trailer")}
                className={`px-4 py-3 rounded-lg border-2 transition ${
                  modalMaintenance.resourceType === "trailer"
                    ? "border-[#3b8492] bg-[#3b8492] text-white"
                    : "border-gray-200 hover:border-[#3b8492]"
                }`}
              >
                🚚 Remorque
              </button>
              <button
                type="button"
                onClick={() => handleResourceTypeChange("pneu")}
                className={`px-4 py-3 rounded-lg border-2 transition ${
                  modalMaintenance.resourceType === "pneu"
                    ? "border-[#3b8492] bg-[#3b8492] text-white"
                    : "border-gray-200 hover:border-[#3b8492]"
                }`}
              >
                ⚙️ Pneu
              </button>
            </div>
          </div>

          {/* Sélection de la ressource */}
          {modalMaintenance.resourceType === "truck" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                <TruckIcon className="inline w-4 h-4 mr-1" />
                Camion *
              </label>
              <select 
                value={modalMaintenance.truck} 
                onChange={e => setModalMaintenance({...modalMaintenance, truck: e.target.value})}
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
          )}

          {modalMaintenance.resourceType === "trailer" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">Remorque *</label>
              <select 
                value={modalMaintenance.trailer} 
                onChange={e => setModalMaintenance({...modalMaintenance, trailer: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
              >
                <option value="">Sélectionner une remorque</option>
                {trailers.map(trailer => (
                  <option key={trailer._id} value={trailer._id}>
                    {trailer.plateNumber} - {trailer.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {modalMaintenance.resourceType === "pneu" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">Pneu *</label>
              <select 
                value={modalMaintenance.pneu} 
                onChange={e => setModalMaintenance({...modalMaintenance, pneu: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
              >
                <option value="">Sélectionner un pneu</option>
                {pneus.map(pneu => (
                  <option key={pneu._id} value={pneu._id}>
                    {pneu.marque} - {pneu.position} ({pneu.truck?.immatriculation || pneu.trailer?.plateNumber || 'Non assigné'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Règle de maintenance */}
          {modalMaintenance.resourceType && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#2a6570] mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Règle de maintenance *
              </label>
              <select 
                value={modalMaintenance.rule} 
                onChange={e => setModalMaintenance({...modalMaintenance, rule: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]"
              >
                <option value="">Sélectionner une règle</option>
                {rules
                  .filter(rule => rule.type === modalMaintenance.resourceType)
                  .map(rule => (
                    <option key={rule._id} value={rule._id}>
                      {rule.action}
                      {rule.intervalKm > 0 && ` - ${rule.intervalKm} km`}
                      {rule.intervalDays > 0 && ` - ${rule.intervalDays} jours`}
                    </option>
                  ))}
              </select>
              {rules.filter(rule => rule.type === modalMaintenance.resourceType).length === 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Aucune règle disponible pour ce type de ressource. Créez-en une dans "Règles maintenance".
                </p>
              )}
            </div>
          )}

          {/* Kilométrage au moment de la maintenance */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Kilométrage au moment de la maintenance
            </label>
            <input 
              type="number" 
              min="0"
              value={modalMaintenance.kmAtMaintenance} 
              onChange={e => setModalMaintenance({...modalMaintenance, kmAtMaintenance: parseInt(e.target.value) || 0})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="0"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#2a6570] mb-2">
              Notes supplémentaires
            </label>
            <textarea 
              rows="3"
              value={modalMaintenance.notes} 
              onChange={e => setModalMaintenance({...modalMaintenance, notes: e.target.value})} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492]" 
              placeholder="Notes, observations..."
            />
          </div>
        </div>

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
            {modalMaintenance._id ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
