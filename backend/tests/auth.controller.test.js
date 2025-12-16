import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { login, logout } from "../controllers/auth.controller.js";

jest.mock("../models/User.model.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller - login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@mail.com",
        password: "123456"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it("devrait connecter l'utilisateur avec succès", async () => {
    const user = {
      _id: "user123",
      name: "Test User",
      email: "test@mail.com",
      passwordHash: "hashedPassword",
      role: "driver",
      mustChangePassword: true
    };

    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-jwt-token");

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@mail.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashedPassword");
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user123", role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    expect(res.json).toHaveBeenCalledWith({
      message: "Connexion reussie",
      success: true,
      mustChangePassword: true,
      data: {
        token: "fake-jwt-token",
        user: {
          id: "user123",
          name: "Test User",
          role: "driver",
          mustChangePassword: true
        }
      }
    });
  });

  it("devrait refuser si email incorrect", async () => {
    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email ou mot de passe invalide"
    });
  });

  it("devrait refuser si mot de passe incorrect", async () => {
    const user = {
      passwordHash: "hashedPassword"
    };

    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email ou mot de passe invalide"
    });
  });

  it("devrait retourner 500 en cas d'erreur serveur", async () => {
    User.findOne.mockRejectedValue(new Error("DB Error"));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "DB Error"
    });
  });
});

describe("Auth Controller - logout", () => {
  it("devrait déconnecter l'utilisateur", () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    logout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Déconnexion réussie",
      success: true
    });
  });
});
