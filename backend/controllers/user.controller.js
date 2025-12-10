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

