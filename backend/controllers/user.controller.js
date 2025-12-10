import { createDriverAndSendEmail } from "../services/user.services.js";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";

export const createDriver = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const driver = await createDriverAndSendEmail({ name, email });

    res.status(201).json({
      success: true,
      message: "Chauffeur créé et email envoyé avec succès",
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    console.log("req.user:", req.user);
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Si on veut vérifier l'ancien mot de passe
    if (user.mustChangePassword === false && oldPassword) {
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid) return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.mustChangePassword = false;

    await user.save();

    res.json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    console.log("req.params", req.params);
    const deleteUser = await User.findByIdAndDelete(req.params.userId);
    if (!deleteUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    next(err);
  }
};

export const getAllDrivers= async (req,res,next)=>{
  try{
  const page =parseInt(req.query.page)||1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const drivers = await User.find({ role: "driver" }).skip(skip).limit(limit);
  res.status(200).json({
    message : "Liste des chauffeurs",
    data : drivers
  });
  }
  catch(err){
    next(err);
  }
}