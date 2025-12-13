import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPneus, selectPneu, deletePneu, updatePneu, createPneu } from "../features/pneuSlice";
import Sidebare from "../components/sidebare";
import PneuModal from "../components/PneuModal";

export default function PneusPage() {
  const dispatch = useDispatch();
  const { list, selectedPneu, loading, error } = useSelector(state => state.pneus);
  const [modalPneu, setModalPneu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => { 
    dispatch(fetchPneus()); 
  }, [dispatch]);

  const handleSave = async (pneu) => {
    setIsSubmitting(true); 
    try {
      if (pneu._id) {
        await dispatch(updatePneu({ id: pneu._id, pneuData: pneu })).unwrap();
      } else {
        await dispatch(createPneu(pneu)).unwrap();
      }
      
      await dispatch(fetchPneus()).unwrap();
      
      setModalPneu(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pneuId) => {
    if (window.confirm("Supprimer ce pneu ?")) {
      setIsSubmitting(true); 
      try {
        await dispatch(deletePneu(pneuId)).unwrap();
        await dispatch(fetchPneus()).unwrap();
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
          <h2 className="text-xl font-semibold text-[#2a6570]">Liste des pneus</h2>
          <button 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" 
            onClick={() => setModalPneu({})}
            disabled={isSubmitting}
          >
            + Ajouter
          </button>
        </div>
        {loading && list.length === 0 && <p className="p-4 text-gray-500">Chargement des pneus...</p>}
        
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
                <th className="p-3">Position</th>
                <th className="p-3">Usure %</th>
                <th className="p-3">Marque</th>
                <th className="p-3">Véhicule</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(pneu => (
                <tr key={pneu._id} className="border-b hover:bg-[#f0f9fa] cursor-pointer" onClick={() => dispatch(selectPneu(pneu))}>
                  <td className="p-3">{pneu.position}</td>
                  <td className="p-3">{pneu.usurePourcentage}%</td>
                  <td className="p-3">{pneu.marque}</td>
                  <td className="p-3">
                    {pneu.truck ? (
                      <div className="text-sm">
                        <span className="font-semibold">🚛 {pneu.truck.immatriculation}</span>
                        <br />
                        <span className="text-gray-500">{pneu.truck.marque} {pneu.truck.modele}</span>
                      </div>
                    ) : pneu.trailer ? (
                      <div className="text-sm">
                        <span className="font-semibold">🚚 {pneu.trailer.plateNumber}</span>
                        <br />
                        <span className="text-gray-500">{pneu.trailer.type}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {pneu.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); setModalPneu(pneu); }}
                      disabled={isSubmitting}
                    >
                      Modifier
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 rounded disabled:opacity-50" 
                      onClick={e => { e.stopPropagation(); handleDelete(pneu._id); }}
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
        {selectedPneu ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4">Détails du pneu</h2>
            <p><b>Position :</b> {selectedPneu.position}</p>
            <p><b>Usure % :</b> {selectedPneu.usurePourcentage}%</p>
            <p><b>Marque :</b> {selectedPneu.marque}</p>
            <p><b>Statut :</b> {selectedPneu.status}</p>
            
            {selectedPneu.truck && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800">🚛 Camion assigné</p>
                <p className="text-sm"><b>Immatriculation :</b> {selectedPneu.truck.immatriculation}</p>
                <p className="text-sm"><b>Marque :</b> {selectedPneu.truck.marque}</p>
                <p className="text-sm"><b>Modèle :</b> {selectedPneu.truck.modele}</p>
              </div>
            )}

            {selectedPneu.trailer && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-800">🚚 Remorque assignée</p>
                <p className="text-sm"><b>Plaque :</b> {selectedPneu.trailer.plateNumber}</p>
                <p className="text-sm"><b>Type :</b> {selectedPneu.trailer.type}</p>
              </div>
            )}

            {!selectedPneu.truck && !selectedPneu.trailer && (
              <p className="mt-3 text-gray-500 italic">Non assigné à un véhicule</p>
            )}

            <p className="mt-3"><b>Date installation :</b> {selectedPneu.dateInstallation ? new Date(selectedPneu.dateInstallation).toLocaleDateString() : 'N/A'}</p>
            <p><b>Dernière maintenance :</b> {selectedPneu.lastMaintenance ? new Date(selectedPneu.lastMaintenance).toLocaleDateString() : 'N/A'}</p>
          </>
        ) : <p className="text-gray-500">Sélectionnez un pneu pour voir les détails</p>}
      </div>

      {modalPneu && <PneuModal pneu={modalPneu} onClose={() => setModalPneu(null)} onSave={handleSave} />}
    </div>
  );
}
