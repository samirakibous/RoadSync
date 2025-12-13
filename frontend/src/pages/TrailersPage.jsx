import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrailers, selectTrailer, deleteTrailer, updateTrailer, createTrailer } from "../features/trailerSlice";
import Sidebare from "../components/sidebare";
import TrailerModal from "../components/TrailerModal";

export default function TrailersPage() {
  const dispatch = useDispatch();
  const { list, selectedTrailer, loading, error, trailerStatus } = useSelector(s => s.trailers);

  const [modalTrailer, setModalTrailer] = useState(null);

  useEffect(() => { dispatch(fetchTrailers()); }, [dispatch]);

  const handleSave = async (trailer) => {
    try {
      if (trailer._id) {
        //modification
        await dispatch(updateTrailer({ id: trailer._id, trailerData: trailer })).unwrap();
      } else {
        //création
        await dispatch(createTrailer(trailer)).unwrap();
      }
      
      await dispatch(fetchTrailers()).unwrap();
      
      setModalTrailer(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    }
  };

  const handleDelete = async (trailerId) => {
    if (window.confirm("Supprimer cette remorque ?")) {
      try {
        await dispatch(deleteTrailer(trailerId)).unwrap();
        await dispatch(fetchTrailers()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };
  return (
    <div className="flex gap-6 min-h-screen p-6 bg-gray-50">
      <Sidebare />

      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-[#2a6570]">Liste des remorques</h2>
          <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={()=>setModalTrailer({})}>+ Ajouter</button>
        </div>

        {loading && <p className="p-4 text-gray-500">Chargement des remorques...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-3">Immatriculation</th>
                <th className="p-3">Type</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(trailer=>(
                <tr key={trailer._id} className="border-b hover:bg-[#f0f9fa] cursor-pointer" onClick={()=>dispatch(selectTrailer(trailer))}>
                  <td className="p-3">{trailer.plateNumber}</td>
                  <td className="p-3">{trailer.type}</td>
                  <td className="p-3"><span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">{trailer.status}</span></td>
                  <td className="p-3 flex gap-2">
                    <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded" onClick={e=>{e.stopPropagation(); setModalTrailer(trailer)}}>Modifier</button>
<button
                      className="px-2 py-1 bg-red-100 text-red-700 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(trailer._id);
                      }}
                    >                        Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="w-1/3 bg-white rounded-xl shadow p-4">
        {selectedTrailer ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4">Détails de la remorque</h2>
            <p><b>Immatriculation :</b> {selectedTrailer.plateNumber}</p>
            <p><b>Type :</b> {selectedTrailer.type}</p>
            <p><b>Statut :</b> {selectedTrailer.status}</p>
            <p><b>maxLoad :</b> {selectedTrailer.maxLoad}</p>
            <p><b>date achat :</b> {selectedTrailer.purchaseDate}</p>
            <p><b>Dernière maintenance :</b> {selectedTrailer.lastMaintenance}</p>
            <p><b>Création :</b> {selectedTrailer.createdAt}</p>
            <p><b>Derniére modification :</b> {selectedTrailer.updatedAt}</p>
          </>
        ) : <p className="text-gray-500">Sélectionnez une remorque pour voir les détails</p>}
      </div>

      {modalTrailer && <TrailerModal trailer={modalTrailer} onClose={()=>setModalTrailer(null)} onSave={handleSave} trailerStatus={trailerStatus} />}
    </div>
  );
}
