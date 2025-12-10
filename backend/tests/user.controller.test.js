import { createDriver } from "../controllers/user.controller.js";
import * as userService from "../services/user.services.js";
// import { updatePassword } from "../controllers/user.controller.js";
// import User from "../models/User.model.js";
// import bcrypt from "bcrypt";

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

