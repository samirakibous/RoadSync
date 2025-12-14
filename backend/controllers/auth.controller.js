import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            message: 'Connexion reussie',
            success: true,
            mustChangePassword: user.mustChangePassword,
            data: {
                token,
                user: { 
                    id: user._id, 
                    name: user.name, 
                    role: user.role,
                    mustChangePassword: user.mustChangePassword
                }
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const logout = (req, res) => {
    res.status(200).json({
        message: "Déconnexion réussie",
        success: true
    });
};