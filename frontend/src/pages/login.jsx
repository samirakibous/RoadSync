import React, { useState } from 'react';
import { Truck, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice.jsx";
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { text: 'Au moins 8 caractères', met: password.length >= 8 },
    { text: 'Lettres et chiffres', met: /[a-zA-Z]/.test(password) && /[0-9]/.test(password) }
  ];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("la reponse", response);
      const data = await response.json();
      console.log("la data", data);
      if (!response.ok) {
        setError(data.message || "Erreur lors de la connexion");
        setLoading(false);
        return;
      }

      dispatch(setCredentials({
        user: data.data.user,
        token: data.data.token,
      }));

      // Redirection si tu veux plus tard
      navigate("/dashboard");

      setLoading(false);

    } catch (err) {
      setError("Impossible de se connecter au serveur.");
      setLoading(false);
    }
  };

  // Soumettre le formulaire avec Entrée
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };


  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Photo réelle */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a6570]/20 to-[#3b8492]/30 z-10"></div>

        {/* Photo de camion sur route - Image réelle via Unsplash */}
        <img
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop"
          alt="Camion de transport"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Texte sur l'image */}
        <div className="relative z-20 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">SyncRoad</h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md drop-shadow-md">
            Votre solution complète de gestion de transport et logistique.
            Optimisez vos livraisons et suivez vos véhicules en temps réel.
          </p>
        </div>
      </div>

      {/* Section droite - Formulaire avec palette #3b8492 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-[#f0f9fa] to-white">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3b8492] rounded-xl mb-3 shadow-lg">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#2a6570]">SyncRoad</h2>
          </div>

          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2a6570] mb-2">Connectez-vous</h1>
            <p className="text-gray-600">Accédez à votre espace de gestion</p>
          </div>

          {/* Formulaire */}
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#3b8492] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="example@test.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                />
                <Mail className="absolute right-3 top-3.5 w-5 h-5 text-[#3b8492]" />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-[#3b8492] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b8492] focus:border-[#3b8492] outline-none transition"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#3b8492] hover:text-[#2a6570]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Exigences du mot de passe */}
              {password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`w-4 h-4 ${req.met ? 'text-[#3b8492]' : 'text-gray-300'}`}
                      />
                      <span className={req.met ? 'text-[#3b8492]' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#3b8492] hover:bg-[#2a6570] text-white font-semibold py-3.5 rounded-full transition duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Connexion en cours...' : 'Connexion'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-[#f0f9fa] to-white text-gray-500">ou continuez avec</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}