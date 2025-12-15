import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFuelLogs, selectFuelLog, deleteFuelLog, createFuelLog } from "../features/fuelLogSlice";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Info, 
  FileText, 
  AlertCircle,
  Download,
  Eye
} from "lucide-react";
import Sidebare from "../components/sidebare";
import FuelLogModal from "../components/FuelLogModal";

export default function FuelLogsPage() {
  const dispatch = useDispatch();
  const { list, selectedFuelLog, loading, error } = useSelector(state => state.fuelLog);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    dispatch(fetchFuelLogs()); 
  }, [dispatch]);


  const handleDelete = async (fuelLogId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fuel log ?")) {
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

  const getTotalAmount = () => {
    return list.reduce((sum, log) => sum + (log.montant || 0), 0).toFixed(2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebare />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex gap-6 p-6">
        {/* TABLEAU DES FUEL LOGS */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Fuel Logs</h2>
                <p className="text-sm text-gray-500">{list.length} log(s) - Total: {getTotalAmount()} MAD</p>
              </div>
            </div>
          </div>

          {/* Loading & Error */}
          {loading && list.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des fuel logs...</p>
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
                      Trajet
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type Facture
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map((fuelLog) => (
                    <tr 
                      key={fuelLog._id} 
                      className="hover:bg-[#f0f9fa] transition cursor-pointer" 
                      onClick={() => dispatch(selectFuelLog(fuelLog))}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {fuelLog.trip?.lieuDepart} → {fuelLog.trip?.lieuArrivee}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {fuelLog.trip?.driver?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700">{fuelLog.montant} MAD</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {fuelLog.factureType ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                            fuelLog.factureType === 'pdf' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            <FileText className="w-3 h-3" />
                            {fuelLog.factureType.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Aucune facture</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(fuelLog.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(fuelLog._id);
                            }}
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

              {list.length === 0 && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucun fuel log enregistré</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre premier log</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DU FUEL LOG */}
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
            {selectedFuelLog ? (
              <div className="space-y-4">
                {/* Montant */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-800 uppercase mb-1">Montant</p>
                  <p className="text-2xl font-bold text-green-700 flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    {selectedFuelLog.montant} MAD
                  </p>
                </div>

                {/* Trajet */}
                <div className="p-4 bg-[#3b8492]/5 rounded-lg border border-[#3b8492]/20">
                  <p className="text-xs font-semibold text-[#2a6570] uppercase mb-2">Trajet associé</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFuelLog.trip?.lieuDepart} → {selectedFuelLog.trip?.lieuArrivee}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Chauffeur: {selectedFuelLog.trip?.driver?.name || 'N/A'}
                  </p>
                </div>

                {/* Type de facture */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Type de facture</p>
                  {selectedFuelLog.factureType ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      selectedFuelLog.factureType === 'pdf' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      <FileText className="w-3 h-3" />
                      {selectedFuelLog.factureType.toUpperCase()}
                    </span>
                  ) : (
                    <p className="text-gray-400 italic text-sm">Aucune facture</p>
                  )}
                </div>

                {/* Facture */}
                {selectedFuelLog.factureUrl && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Facture</p>
                    {selectedFuelLog.factureType === 'pdf' ? (
                      <a 
                        href={`http://localhost:3000${selectedFuelLog.factureUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition font-semibold"
                      >
                        <Download className="w-5 h-5" />
                        Télécharger le PDF
                      </a>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={`http://localhost:3000${selectedFuelLog.factureUrl}`} 
                          alt="Facture" 
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Date */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Créé le {new Date(selectedFuelLog.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedFuelLog.createdAt).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur un fuel log pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}