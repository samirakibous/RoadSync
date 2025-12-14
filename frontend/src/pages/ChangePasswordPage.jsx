import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setCredentials } from '../features/authSlice';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(s => s.auth);

  const passwordRequirements = [
    { text: 'Au moins 8 caractères', met: newPassword.length >= 8 },
    // { text: 'Lettres et chiffres', met: /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword) }
  ];

  const handleSubmit = async () => {
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError('Le mot de passe ne respecte pas les exigences');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/users/drivers/update-password/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors du changement de mot de passe');
        setLoading(false);
        return;
      }

      // ✅ Mettre à jour l'utilisateur dans Redux pour refléter mustChangePassword: false
      dispatch(setCredentials({
        user: {
          ...user,
          mustChangePassword: false
        },
        token: token // Garder le même token
      }));

      // Rediriger vers le dashboard du chauffeur
      navigate('/driver-dashboard');
    } catch (err) {
      setError('Impossible de se connecter au serveur');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3b8492] to-[#2a6570] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-[#3b8492] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Changement de mot de passe obligatoire
          </h1>
          <p className="text-gray-600 mt-2">
            Pour votre sécurité, veuillez changer votre mot de passe temporaire
          </p>
        </div>

        {/* Formulaire */}
        <div className="space-y-4">
          {/* Ancien mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ancien mot de passe
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-3.5 text-[#3b8492]"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-[#3b8492]"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Exigences du mot de passe */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${req.met ? 'text-[#3b8492]' : 'text-gray-300'}`} />
                    <span className={req.met ? 'text-[#3b8492]' : 'text-gray-500'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-[#3b8492]"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#3b8492] hover:bg-[#2a6570] text-white font-semibold py-3.5 rounded-full transition disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3.5 rounded-full transition"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}