import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const createDriverAndSendEmail = async ({ name, email }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Un utilisateur avec cet email existe déjà");

  const tempPassword = crypto.randomBytes(4).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const driver = await User.create({
    name,
    email,
    passwordHash,
    role: "driver",
    mustChangePassword: true,
  });

  const html = `
    <h3>Bonjour ${name},</h3>
    <p>Votre compte chauffeur a été créé par l'administrateur.</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Mot de passe temporaire :</strong> ${tempPassword}</p>
    <p>Veuillez vous connecter et changer votre mot de passe immédiatement.</p>
    <a href="http://localhost:3000/change-password" style="background:#4CAF50;color:white;padding:10px 15px;text-decoration:none;">Changer mon mot de passe</a>
    <br/><br/>
    <p>Cordialement,</p>
    <p>L'équipe RoadSync</p>
  `;

  await sendEmail({ to: email, subject: "Bienvenue sur la plateforme — vos accès", html });

  return driver;
};
