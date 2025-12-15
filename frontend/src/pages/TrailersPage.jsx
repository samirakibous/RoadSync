import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchTrailers, 
  selectTrailer, 
  deleteTrailer, 
  updateTrailer, 
  createTrailer 
} from "../features/trailerSlice";
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  Info,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Weight
} from "lucide-react";
import Sidebare from "../components/sidebare";
import TrailerModal from "../components/TrailerModal";

export default function TrailersPage() {
  const dispatch = useDispatch();
  const { list, selectedTrailer, loading, error, trailerStatus } = useSelector(state => state.trailers);
  const [modalTrailer, setModalTrailer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchTrailers()); 
  }, [dispatch]);

  const handleSave = async (trailer) => {
    setIsSubmitting(true);
    try {
      if (trailer._id) {
        await dispatch(updateTrailer({ id: trailer._id, trailerData: trailer })).unwrap();
      } else {
        await dispatch(createTrailer(trailer)).unwrap();
      }
      await dispatch(fetchTrailers()).unwrap();
      setModalTrailer(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (trailerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette remorque ?")) {
      setIsSubmitting(true);
      try {
        await dispatch(deleteTrailer(trailerId)).unwrap();
        await dispatch(fetchTrailers()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'disponible': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'en_mission': { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', icon: Clock },
      'en_maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
      'hors_service': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['disponible'];
    const IconComponent = config.icon;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebare />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex gap-6 p-6">
        {/* TABLEAU DES TRAILERS */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Flotte de remorques</h2>
                <p className="text-sm text-gray-500">{list.length} remorque(s) enregistrée(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={() => setModalTrailer({})}
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              Ajouter une remorque
            </button>
          </div>

          {/* Loading & Error */}
          {loading && list.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des remorques...</p>
            </div>
          )}
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Overlay de chargement */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-xl border border-gray-200">
                <div className="w-6 h-6 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#2a6570] font-semibold">Traitement en cours...</span>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Immatriculation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Charge Max
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map((trailer) => (
                    <tr 
                      key={trailer._id} 
                      className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                      onClick={() => dispatch(selectTrailer(trailer))}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#3b8492]/10 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-[#3b8492]" />
                          </div>
                          <span className="font-semibold text-[#2a6570]">{trailer.plateNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{trailer.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Weight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{trailer.maxLoad} kg</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trailer.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-[#3b8492]/10 text-[#3b8492] rounded-lg hover:bg-[#3b8492]/20 transition"
                            onClick={(e) => { e.stopPropagation(); setModalTrailer(trailer); }}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(trailer._id);
                            }}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {list.length === 0 && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Truck className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucune remorque enregistrée</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre première remorque</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DE LA TRAILER */}
        <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#2a6570]">Détails</h2>
            </div>
          </div>

          <div className="p-6">
            {selectedTrailer ? (
              <div className="space-y-4">
                {/* Immatriculation */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <p className="text-xs font-semibold text-[#2a6570] uppercase mb-1">Immatriculation</p>
                  <p className="text-lg font-bold text-[#2a6570]">{selectedTrailer.plateNumber}</p>
                </div>

                {/* Informations principales */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Type</p>
                    <p className="text-gray-900 font-medium">{selectedTrailer.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Charge maximale</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Weight className="w-4 h-4 text-gray-400" />
                      {selectedTrailer.maxLoad} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                    {getStatusBadge(selectedTrailer.status)}
                  </div>
                </div>

                {/* Dates */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {selectedTrailer.purchaseDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#3b8492] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Date d'achat</p>
                        <p className="text-sm text-gray-900">{new Date(selectedTrailer.purchaseDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )}
                  {selectedTrailer.lastMaintenance && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#3b8492] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Dernière maintenance</p>
                        <p className="text-sm text-gray-900">{new Date(selectedTrailer.lastMaintenance).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Métadonnées */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">
                    Créé le {new Date(selectedTrailer.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-400">
                    Modifié le {new Date(selectedTrailer.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur une remorque pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalTrailer && (
        <TrailerModal 
          trailer={modalTrailer} 
          onClose={() => setModalTrailer(null)} 
          onSave={handleSave}
          trailerStatus={trailerStatus}
        />
      )}
    </div>
  );
}
