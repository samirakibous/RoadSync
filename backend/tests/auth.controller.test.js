import { login, logout } from "../controllers/auth.controller.js";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../models/User.model.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("devrait renvoyer 400 si l'utilisateur n'existe pas", async () => {
      req.body = { email: "test@test.com", password: "123456" };
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email ou mot de passe invalide" });
    });

    it("devrait renvoyer 400 si le mot de passe est incorrect", async () => {
      req.body = { email: "test@test.com", password: "123456" };
      User.findOne.mockResolvedValue({ passwordHash: "hashed", _id: "1", role: "user" });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email ou mot de passe invalide" });
    });

    it("devrait renvoyer le token si l'email et le mot de passe sont corrects", async () => {
      req.body = { email: "test@test.com", password: "123456" };
      User.findOne.mockResolvedValue({ _id: "1", name: "Test", role: "user", mustChangePassword: false, passwordHash: "hashed" });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake-jwt-token");

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Connexion reussie",
        success: true,
        mustChangePassword: false,
        data: {
          token: "fake-jwt-token",
          user: { id: "1", name: "Test", role: "user" }
        }
      });
    });

    it("devrait renvoyer 500 en cas d'erreur interne", async () => {
      req.body = { email: "test@test.com", password: "123456" };
      User.findOne.mockRejectedValue(new Error("DB Error"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB Error" });
    });
  });

  describe("logout", () => {
    it("devrait renvoyer un message de déconnexion réussie", () => {
      logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Déconnexion réussie",
        success: true
      });
    });
  });
});


