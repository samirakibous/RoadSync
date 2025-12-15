import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPneus, selectPneu, deletePneu, updatePneu, createPneu } from "../features/pneuSlice";
import { 
  Circle,
  Plus, 
  Edit2, 
  Trash2, 
  Info,
  Truck,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Gauge
} from "lucide-react";
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pneu ?")) {
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Bon': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'Moyen': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
      'Usé': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      'Stock': { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', icon: Circle }
    };
    
    const config = statusConfig[status] || statusConfig['Stock'];
    const IconComponent = config.icon;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getUsureColor = (usure) => {
    if (usure < 30) return 'text-green-600';
    if (usure < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebare />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex gap-6 p-6 relative">
        {/* TABLEAU DES PNEUS */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Gestion des pneus</h2>
                <p className="text-sm text-gray-500">{list.length} pneu(s) enregistré(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              onClick={() => setModalPneu({})}
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              Ajouter un pneu
            </button>
          </div>

          {/* Loading & Error */}
          {loading && list.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des pneus...</p>
            </div>
          )}
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Overlay de chargement pendant une action */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-xl border border-gray-200">
                <div className="w-6 h-6 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#2a6570] font-semibold">Traitement en cours...</span>
              </div>
            </div>
          )}

          {/* Table */}
          {(!loading || list.length > 0) && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usure
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Marque
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Véhicule
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
                  {list.map(pneu => (
                    <tr 
                      key={pneu._id} 
                      className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                      onClick={() => dispatch(selectPneu(pneu))}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#3b8492]" />
                          <span className="font-semibold text-[#2a6570]">{pneu.position}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Gauge className={`w-4 h-4 ${getUsureColor(pneu.usurePourcentage)}`} />
                          <span className={`font-bold ${getUsureColor(pneu.usurePourcentage)}`}>
                            {pneu.usurePourcentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{pneu.marque}</span>
                      </td>
                      <td className="px-6 py-4">
                        {pneu.truck ? (
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-[#3b8492] mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900">{pneu.truck.immatriculation}</p>
                              <p className="text-gray-500 text-xs">{pneu.truck.marque} {pneu.truck.modele}</p>
                            </div>
                          </div>
                        ) : pneu.trailer ? (
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900">{pneu.trailer.plateNumber}</p>
                              <p className="text-gray-500 text-xs">{pneu.trailer.type}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(pneu.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-[#3b8492]/10 text-[#3b8492] rounded-lg hover:bg-[#3b8492]/20 transition disabled:opacity-50"
                            onClick={e => { e.stopPropagation(); setModalPneu(pneu); }}
                            disabled={isSubmitting}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            onClick={e => { e.stopPropagation(); handleDelete(pneu._id); }}
                            disabled={isSubmitting}
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

              {list.length === 0 && !loading && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Circle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucun pneu enregistré</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre premier pneu</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DU PNEU */}
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
            {selectedPneu ? (
              <div className="space-y-4">
                {/* Position */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <p className="text-xs font-semibold text-[#2a6570] uppercase mb-1">Position</p>
                  <p className="text-lg font-bold text-[#2a6570] flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {selectedPneu.position}
                  </p>
                </div>

                {/* Usure */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Niveau d'usure</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          selectedPneu.usurePourcentage < 30 ? 'bg-green-500' :
                          selectedPneu.usurePourcentage < 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedPneu.usurePourcentage}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold text-lg ${getUsureColor(selectedPneu.usurePourcentage)}`}>
                      {selectedPneu.usurePourcentage}%
                    </span>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Marque</p>
                    <p className="text-gray-900 font-medium">{selectedPneu.marque}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                    {getStatusBadge(selectedPneu.status)}
                  </div>
                </div>

                {/* Véhicule assigné */}
                {selectedPneu.truck && (
                  <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-[#3b8492]" />
                      <p className="font-semibold text-[#2a6570]">Camion assigné</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Immatriculation:</span> <span className="font-medium">{selectedPneu.truck.immatriculation}</span></p>
                      <p><span className="text-gray-500">Marque:</span> <span className="font-medium">{selectedPneu.truck.marque}</span></p>
                      <p><span className="text-gray-500">Modèle:</span> <span className="font-medium">{selectedPneu.truck.modele}</span></p>
                    </div>
                  </div>
                )}

                {selectedPneu.trailer && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-800">Remorque assignée</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Plaque:</span> <span className="font-medium">{selectedPneu.trailer.plateNumber}</span></p>
                      <p><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedPneu.trailer.type}</span></p>
                    </div>
                  </div>
                )}

                {!selectedPneu.truck && !selectedPneu.trailer && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-500 italic text-sm">Non assigné à un véhicule</p>
                  </div>
                )}

                {/* Dates */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {selectedPneu.dateInstallation && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#3b8492] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Date d'installation</p>
                        <p className="text-sm text-gray-900">{new Date(selectedPneu.dateInstallation).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )}
                  {selectedPneu.lastMaintenance && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#3b8492] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Dernière maintenance</p>
                        <p className="text-sm text-gray-900">{new Date(selectedPneu.lastMaintenance).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur un pneu pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER/MODIFIER */}
      {modalPneu && (
        <PneuModal 
          pneu={modalPneu} 
          onClose={() => setModalPneu(null)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}