import { createDriver ,deleteDriver , updatePassword , getAllDrivers} from "../controllers/user.controller.js";
import * as userService from "../services/user.services.js";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";

jest.mock("../models/User.model.js");
jest.mock("bcrypt");
jest.mock("../services/user.services.js"); 

describe("Controller - createDriver", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { name: "alexe", email: "alexe@test.com" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait renvoyer 201 et les infos du chauffeur", async () => {
    userService.createDriverAndSendEmail.mockResolvedValue({
      _id: "12345",
      name: "alexe",
      email: "alexe@test.com"
    });

    await createDriver(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Chauffeur créé et email envoyé avec succès",
      data: {
        id: "12345",
        name: "alexe",
        email: "alexe@test.com"
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait appeler next en cas d'erreur", async () => {
    const error = new Error("Email déjà existant");
    userService.createDriverAndSendEmail.mockRejectedValue(error);

    await createDriver(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});


describe("Controller - updatePassword", () => {
  let req, res, next, mockUser;

  beforeEach(() => {
    req = { body: {}, user: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    mockUser = {
      _id: "1",
      passwordHash: "hashedOld",
      mustChangePassword: true,
      save: jest.fn().mockResolvedValue(true)
    };
  });

  it("devrait renvoyer 404 si l'utilisateur n'existe pas", async () => {
    User.findById.mockResolvedValue(null);
    await updatePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
  });

  it("devrait renvoyer 400 si l'ancien mot de passe est incorrect", async () => {
    mockUser.mustChangePassword = false;
    req.body = { oldPassword: "wrong", newPassword: "newPass123" };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await updatePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Ancien mot de passe incorrect" });
  });

  it("devrait mettre à jour le mot de passe avec succès", async () => {
    req.body = { oldPassword: "oldPass123", newPassword: "newPass123" };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashedNew");

    await updatePassword(req, res, next);

    expect(mockUser.passwordHash).toBe("hashedNew");
    expect(mockUser.mustChangePassword).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Mot de passe mis à jour avec succès"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    User.findById.mockRejectedValue(new Error("DB Error"));

    await updatePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - deleteDriver", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait supprimer un chauffeur et renvoyer 200", async () => {
    User.findByIdAndDelete.mockResolvedValue({ _id: "123", name: "test" });

    await deleteDriver(req, res, next);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utilisateur supprimé avec succès"
    });
  });

  it("devrait renvoyer 404 si l'utilisateur n'existe pas", async () => {
    User.findByIdAndDelete.mockResolvedValue(null);

    await deleteDriver(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utilisateur non trouvé"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    User.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

    await deleteDriver(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - getAllDrivers", () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: { page: "1", limit: "10" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait retourner la liste des chauffeurs", async () => {

    const mockDrivers = [
      { _id: "1", name: "Driver 1" },
      { _id: "2", name: "Driver 2" },
    ];

    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(mockDrivers);

    User.find.mockReturnValue({
      skip: skipMock,
      limit: limitMock
    });

    await getAllDrivers(req, res, next);

    expect(User.find).toHaveBeenCalledWith({ role: "driver" });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Liste des chauffeurs",
      data: mockDrivers
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    User.find.mockImplementation(() => {
      throw new Error("DB error");
    });

    await getAllDrivers(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
