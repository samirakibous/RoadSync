import { createTruck, getAllTrucks, updateTruck, deleteTruck, getTruckById } from "../controllers/Truck.controller.js";
import Truck from "../models/Truck.model.js";

jest.mock("../models/Truck.model.js");

describe("Controller - createTruck", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { immatriculation: "123ABC", modele: "Volvo", kilometrage: 10000, statut: "actif", dateAchat: "2025-01-01", derniereMaintenance: "2025-06-01" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait créer un camion si l'immatriculation n'existe pas", async () => {
    Truck.findOne.mockResolvedValue(null);
    Truck.create.mockResolvedValue(req.body);

    await createTruck(req, res, next);

    expect(Truck.findOne).toHaveBeenCalledWith({ immatriculation: "123ABC" });
    expect(Truck.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Camion créé avec succès",
      data: req.body
    });
  });

  it("devrait renvoyer 400 si le camion existe déjà", async () => {
    Truck.findOne.mockResolvedValue({ immatriculation: "123ABC" });

    await createTruck(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Camion déjà existant avec cette immatriculation"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Truck.findOne.mockRejectedValue(new Error("DB Error"));

    await createTruck(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - getAllTrucks", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait renvoyer la liste des camions", async () => {
    const trucks = [{ immatriculation: "123ABC" }, { immatriculation: "456DEF" }];
    Truck.find.mockResolvedValue(trucks);

    await getAllTrucks(req, res, next);

    expect(Truck.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Liste des camions",
      data: trucks
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Truck.find.mockRejectedValue(new Error("DB Error"));

    await getAllTrucks(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - updateTruck", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: "1" }, body: { modele: "Mercedes" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait mettre à jour un camion existant", async () => {
    const updatedTruck = { _id: "1", modele: "Mercedes" };
    Truck.findByIdAndUpdate.mockResolvedValue(updatedTruck);

    await updateTruck(req, res, next);

    expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith("1", req.body, { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Camion mis à jour avec succès",
      data: updatedTruck
    });
  });

  it("devrait renvoyer 404 si le camion n'existe pas", async () => {
    Truck.findByIdAndUpdate.mockResolvedValue(null);

    await updateTruck(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Camion non trouvé"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Truck.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

    await updateTruck(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - deleteTruck", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait supprimer un camion existant", async () => {
    Truck.findByIdAndDelete.mockResolvedValue({ _id: "1" });

    await deleteTruck(req, res, next);

    expect(Truck.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Camion supprimé avec succès"
    });
  });

  it("devrait renvoyer 404 si le camion n'existe pas", async () => {
    Truck.findByIdAndDelete.mockResolvedValue(null);

    await deleteTruck(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Camion non trouvé"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Truck.findByIdAndDelete.mockRejectedValue(new Error("DB Error"));

    await deleteTruck(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("GET /trucks/:id - getTruckById", () => {

  let req, res, next;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("renvoie un camion si trouvé", async () => {
    const mockTruck = { _id: "123", modele: "Volvo" };

    Truck.findById.mockResolvedValue(mockTruck);

    await getTruckById(req, res, next);

    expect(Truck.findById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockTruck,
    });
  });

  it("renvoie 404 si camion non trouvé", async () => {
    Truck.findById.mockResolvedValue(null);

    await getTruckById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Camion non trouvé",
    });
  });

  it("appelle next(err) en cas d’erreur", async () => {
    const error = new Error("DB error");
    Truck.findById.mockRejectedValue(error);

    await getTruckById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});