import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, selectUser, deleteUser, createUser } from "../features/userSlice";
import { 
  Users, 
  Plus, 
  Trash2, 
  Info,
  Mail,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import Sidebare from "../components/sidebare";
import UserModal from "../components/UserModal";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list, selectedUser, loading, error, roles } = useSelector(s => s.users);
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => { 
    dispatch(fetchUsers()); 
  }, [dispatch]);

  const handleSave = async (user) => {
    try {
      await dispatch(createUser(user)).unwrap();
      await dispatch(fetchUsers()).unwrap();
      setModalUser(null);
    } catch (err) {
      console.error("Erreur lors de la création:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        await dispatch(fetchUsers()).unwrap();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'Admin': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Shield },
      'Manager': { bg: 'bg-[#3b8492]/10', text: 'text-[#3b8492]', icon: CheckCircle },
      'Chauffeur': { bg: 'bg-blue-100', text: 'text-blue-700', icon: User },
      'Utilisateur': { bg: 'bg-gray-100', text: 'text-gray-700', icon: User }
    };
    
    const config = roleConfig[role] || roleConfig['Utilisateur'];
    const IconComponent = config.icon;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {role}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebare />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex gap-6 p-6">
        {/* TABLEAU DES UTILISATEURS */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2a6570]">Gestion des utilisateurs</h2>
                <p className="text-sm text-gray-500">{list.length} utilisateur(s) enregistré(s)</p>
              </div>
            </div>
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#3b8492] text-white hover:bg-[#2a6570] font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={() => setModalUser({})}
            >
              <Plus className="w-5 h-5" />
              Ajouter un utilisateur
            </button>
          </div>

          {/* Loading & Error */}
          {loading && (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#3b8492] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des utilisateurs...</p>
            </div>
          )}
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map((user, index) => (
                    <tr 
                      key={user._id || user.email || index}
                      className="hover:bg-[#f0f9fa] transition cursor-pointer"
                      onClick={() => dispatch(selectUser(user))}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#3b8492] rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user._id);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {list.length === 0 && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Aucun utilisateur enregistré</p>
                  <p className="text-sm text-gray-400">Commencez par ajouter votre premier utilisateur</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DÉTAILS DE L'UTILISATEUR */}
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
            {selectedUser ? (
              <div className="space-y-6">
                {/* Avatar et nom */}
                <div className="text-center pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-[#3b8492] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                </div>

                {/* Informations */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#3b8492] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Nom complet</p>
                      <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#3b8492] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Adresse email</p>
                      <p className="text-gray-900 font-medium break-all">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#3b8492] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rôle</p>
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                </div>

                {/* Métadonnées */}
                {(selectedUser.createdAt || selectedUser.updatedAt) && (
                  <div className="pt-6 border-t border-gray-200 space-y-2">
                    {selectedUser.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Créé le {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {selectedUser.updatedAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Modifié le {new Date(selectedUser.updatedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions rapides */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleDelete(selectedUser._id)}
                    className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer cet utilisateur
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">Aucune sélection</p>
                <p className="text-sm text-gray-400">Cliquez sur un utilisateur pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POUR CRÉER UN UTILISATEUR */}
      {modalUser && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onSave={handleSave}
          roles={roles}
        />
      )}
    </div>
  );
}