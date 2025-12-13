import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFuelLogs, selectFuelLog, deleteFuelLog, createFuelLog } from "../features/fuelLogSlice";
import Sidebare from "../components/sidebare";
import FuelLogModal from "../components/FuelLogModal";

export default function FuelLogsPage() {
  const dispatch = useDispatch();
  const { list, selectedFuelLog, loading, error } = useSelector(state => state.fuelLog);
  const [modalFuelLog, setModalFuelLog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchFuelLogs()); 
  }, [dispatch]);

  const handleSave = async (fuelLog) => {
    setIsSubmitting(true);
    try {
      await dispatch(createFuelLog(fuelLog)).unwrap();
      await dispatch(fetchFuelLogs()).unwrap();
      setModalFuelLog(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (fuelLogId) => {
    if (window.confirm("Supprimer ce log de carburant ?")) {
      setIsSubmitting(true);
      try {
        await dispatch(deleteFuelLog(fuelLogId)).unwrap();
        await dispatch(fetchFuelLogs()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex gap-6 min-h-screen p-6 bg-gray-50">
      <Sidebare />

      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-[#2a6570]">Logs de carburant</h2>
          <button 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" 
            onClick={() => setModalFuelLog({})}
            disabled={isSubmitting}
          >
            + Ajouter
          </button>
        </div>

        {loading && list.length === 0 && <p className="p-4 text-gray-500">Chargement des logs...</p>}
        
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
                <th className="p-3">Montant</th>
                <th className="p-3">Type Facture</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(fuelLog => (
                <tr 
                  key={fuelLog._id} 
                  className="border-b hover:bg-[#f0f9fa] cursor-pointer" 
                  onClick={() => dispatch(selectFuelLog(fuelLog))}
                >
                  <td className="p-3">
                    {fuelLog.trip?.lieuDepart} → {fuelLog.trip?.lieuArrivee}
                  </td>
                  <td className="p-3 font-semibold text-green-700">{fuelLog.montant} MAD</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${fuelLog.factureType === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {fuelLog.factureType || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">{new Date(fuelLog.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); setModalFuelLog(fuelLog); }}
                      disabled={isSubmitting}
                    >
                      Voir
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); handleDelete(fuelLog._id); }}
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
        {selectedFuelLog ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4">Détails du log</h2>
            <p><b>Trajet :</b> {selectedFuelLog.trip?.lieuDepart} → {selectedFuelLog.trip?.lieuArrivee}</p>
            <p><b>Montant :</b> <span className="text-green-700 font-bold">{selectedFuelLog.montant} MAD</span></p>
            <p><b>Type facture :</b> {selectedFuelLog.factureType || 'N/A'}</p>
            <p><b>Date :</b> {new Date(selectedFuelLog.createdAt).toLocaleDateString()}</p>
            
            {selectedFuelLog.factureUrl && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Facture :</p>
                {selectedFuelLog.factureType === 'pdf' ? (
                  <a 
                    href={`http://localhost:3000${selectedFuelLog.factureUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📄 Télécharger le PDF
                  </a>
                ) : (
                  <img 
                    src={`http://localhost:3000${selectedFuelLog.factureUrl}`} 
                    alt="Facture" 
                    className="w-full rounded-lg shadow"
                  />
                )}
              </div>
            )}
          </>
        ) : <p className="text-gray-500">Sélectionnez un log pour voir les détails</p>}
      </div>

      {modalFuelLog && <FuelLogModal fuelLog={modalFuelLog} onClose={() => setModalFuelLog(null)} onSave={handleSave} />}
    </div>
  );
}