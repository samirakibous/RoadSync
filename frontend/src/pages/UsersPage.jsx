import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, selectUser, deleteUser, createUser } from "../features/userSlice";
import Sidebare from "../components/sidebare";
import UserModal from "../components/UserModal";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list, selectedUser, loading, error, roles } = useSelector(s => s.users);
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

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
    if (window.confirm("Supprimer cet utilisateur ?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        await dispatch(fetchUsers()).unwrap();
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
          <h2 className="text-xl font-semibold text-[#2a6570]">Liste des utilisateurs</h2>
          <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={()=>setModalUser({})}>+ Ajouter</button>
        </div>

        {loading && <p className="p-4 text-gray-500">Chargement...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
           <tbody>
  {list.map((user, index) => (
    <tr 
      key={user._id || user.email || index} // clé unique garantie
      className="border-b hover:bg-[#f0f9fa] cursor-pointer"
      onClick={() => dispatch(selectUser(user))}
    >
      <td className="p-3">{user.name}</td>
      <td className="p-3">{user.email}</td>
      <td className="p-3">
        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
          {user.role}
        </span>
      </td>
      <td className="p-3 flex gap-2">
        <button
          className="px-2 py-1 bg-red-100 text-red-700 rounded"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(user._id);
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

      {/* Détails utilisateur */}
      <div className="w-1/3 bg-white rounded-xl shadow p-4">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-semibold text-[#2a6570] mb-4">Détails utilisateur</h2>
            <p><b>Nom :</b> {selectedUser.name}</p>
            <p><b>Email :</b> {selectedUser.email}</p>
            <p><b>Rôle :</b> {selectedUser.role}</p>
          </>
        ) : (
          <p className="text-gray-500">Sélectionnez un utilisateur</p>
        )}
      </div>

      {/* Modal */}
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
