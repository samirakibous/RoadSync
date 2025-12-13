import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchTrucks, 
  selectTruck, 
  deleteTruck, 
  updateTruck, 
  createTruck 
} from "../features/truckSlice";
import Sidebare from '../components/sidebare';
import TruckModal from "../components/TruckModal";

export default function TrucksPage() {
  const dispatch = useDispatch();
  const { list, selectedTruck, loading, error } = useSelector(state => state.trucks);

  // Un seul état pour le modal
  const [modalTruck, setModalTruck] = useState(null); // null = fermé, objet = créer ou modifier

  useEffect(() => {
    dispatch(fetchTrucks());
  }, [dispatch]);

  // Handler pour créer ou modifier
  const handleSave = async (truck) => {
    try {
      if (truck._id) {
        // ✅ Modification : attendre que l'action soit terminée
        await dispatch(updateTruck({ id: truck._id, truckData: truck })).unwrap();
      } else {
        // ✅ Création : attendre que l'action soit terminée
        await dispatch(createTruck(truck)).unwrap();
      }
      
      // ✅ Recharger la liste après l'ajout/modification
      await dispatch(fetchTrucks()).unwrap();
      
      setModalTruck(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    }
  };

  // ✅ Handler pour la suppression
  const handleDelete = async (truckId) => {
    if (window.confirm("Supprimer ce camion ?")) {
      try {
        await dispatch(deleteTruck(truckId)).unwrap();
        // Recharger la liste après suppression
        await dispatch(fetchTrucks()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  return (
    <div className="flex gap-6 min-h-screen p-6 bg-gray-50">

      {/* SIDEBARE */}
      <Sidebare />

      {/* TABLEAU DES TRUCKS */}
      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-[#2a6570]">Liste des camions</h2>
          <button 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            onClick={() => setModalTruck({})} // ouvre modal pour créer
          >
            + Ajouter
          </button>
        </div>

        {loading && <p className="p-4 text-gray-500">Chargement des camions...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-3">Immatriculation</th>
                <th className="p-3">Kilométrage</th>
                <th className="p-3">Modèle</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((truck) => (
                <tr 
                  key={truck._id} 
                  className="border-b hover:bg-[#f0f9fa] cursor-pointer" 
                  onClick={() => dispatch(selectTruck(truck))}
                >
                  <td className="p-3">{truck.immatriculation}</td>
                  <td className="p-3">{truck.kilometrage}</td>
                  <td className="p-3">{truck.modele}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">{truck.statut}</span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
                      onClick={(e) => { e.stopPropagation(); setModalTruck(truck); }}
                    >
                      Modifier
                    </button>
                    <button
                      className="px-2 py-1 bg-red-100 text-red-700 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(truck._id); // ✅ Utiliser le nouveau handler
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DÉTAILS DU TRUCK */}
      <div className="w-1/3 bg-white rounded-xl shadow p-4">
        {selectedTruck ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4">Détails du camion</h2>
            <p><b>Immatriculation :</b> {selectedTruck.immatriculation}</p>
            <p><b>Kilométrage :</b> {selectedTruck.kilometrage}</p>
            <p><b>Modèle :</b> {selectedTruck.modele}</p>
            <p><b>Statut :</b> {selectedTruck.statut}</p>
            <p><b>Date d'achat :</b> {selectedTruck.dateAchat}</p>
            <p><b>Dernière maintenance :</b> {selectedTruck.derniereMaintenance}</p>
            <p><b>Créé le :</b> {selectedTruck.createdAt}</p>
            <p><b>Dernière modification :</b> {selectedTruck.updatedAt}</p>
          </>
        ) : (
          <p className="text-gray-500">Sélectionnez un camion pour voir les détails</p>
        )}
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalTruck && (
        <TruckModal
          truck={modalTruck}
          onClose={() => setModalTruck(null)}
          onSave={handleSave} // passe le handler
        />
      )}
    </div>
  );
}
