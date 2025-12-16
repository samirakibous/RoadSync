import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  startTrip,
  endTrip,
  getTripByDriver
} from "../controllers/trip.controller.js";

import Trip from "../models/Trip.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import User from "../models/User.model.js";
import Pneu from "../models/Pneu.model.js";

// ================== MOCKS ==================
jest.mock("../models/Trip.model.js");
jest.mock("../models/Truck.model.js");
jest.mock("../models/Trailer.model.js");
jest.mock("../models/User.model.js");
jest.mock("../models/Pneu.model.js");

// ================== SETUP ==================
describe("Trip Controller - Tests unitaires", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // ======================================================
  // CREATE TRIP
  // ======================================================
  describe("createTrip", () => {
    it("doit créer un trajet avec succès", async () => {
      req.body = {
        truck: "truck1",
        driver: "driver1",
        lieuDepart: "Casa",
        lieuArrivee: "Rabat",
        datDepart: new Date(),
        dateArrivee: new Date()
      };

      Truck.findById.mockResolvedValue({ _id: "truck1" });
      User.findById.mockResolvedValue({ _id: "driver1", role: "driver" });
      Trip.create.mockResolvedValue({ _id: "trip1" });

      await createTrip(req, res, next);

      expect(Trip.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("doit refuser si le camion est invalide", async () => {
      req.body = { truck: "badTruck", driver: "driver1" };

      Truck.findById.mockResolvedValue(null);

      await createTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Camion invalide"
      });
    });

    it("doit refuser si le chauffeur n'est pas driver", async () => {
      req.body = { truck: "truck1", driver: "user1" };

      Truck.findById.mockResolvedValue({ _id: "truck1" });
      User.findById.mockResolvedValue({ _id: "user1", role: "admin" });

      await createTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Chauffeur invalide"
      });
    });
  });

  // ======================================================
  // GET ALL TRIPS
  // ======================================================
  describe("getAllTrips", () => {
    it("doit retourner la liste des trajets", async () => {
      Trip.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ _id: "trip1" }])
      });

      await getAllTrips(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  // ======================================================
  // GET TRIP BY ID
  // ======================================================
 describe("getTripById", () => {
  it("doit retourner un trajet par id", async () => {
    req.params.id = "trip1";

    const populate3 = jest.fn().mockResolvedValue({ _id: "trip1" });
    const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
    const populate1 = jest.fn().mockReturnValue({ populate: populate2 });

    Trip.findById.mockReturnValue({ populate: populate1 });

    await getTripById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { _id: "trip1" }
    });
  });

  it("doit retourner 404 si trajet non trouvé", async () => {
    req.params.id = "trip1";

    const populate3 = jest.fn().mockResolvedValue(null);
    const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
    const populate1 = jest.fn().mockReturnValue({ populate: populate2 });

    Trip.findById.mockReturnValue({ populate: populate1 });

    await getTripById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Trajet non trouvé"
    });
  });
});


  // ======================================================
  // UPDATE TRIP
  // ======================================================
  describe("updateTrip", () => {
    it("doit mettre à jour un trajet", async () => {
      req.params.id = "trip1";
      req.body = { status: "en-cours" };

      const tripMock = {
        save: jest.fn(),
        populate: jest.fn()
      };

      Trip.findById.mockResolvedValue(tripMock);

      await updateTrip(req, res, next);

      expect(tripMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("doit retourner 404 si trajet non trouvé", async () => {
      Trip.findById.mockResolvedValue(null);

      await updateTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ======================================================
  // DELETE TRIP
  // ======================================================
  describe("deleteTrip", () => {
    it("doit supprimer un trajet", async () => {
      Trip.findByIdAndDelete.mockResolvedValue({ _id: "trip1" });

      await deleteTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("doit retourner 404 si trajet non trouvé", async () => {
      Trip.findByIdAndDelete.mockResolvedValue(null);

      await deleteTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ======================================================
  // START TRIP
  // ======================================================
  describe("startTrip", () => {
    it("doit refuser si le trajet n'est pas a-faire", async () => {
      Trip.findById.mockResolvedValue({ status: "en-cours" });

      await startTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("doit démarrer un trajet", async () => {
      const tripMock = {
        status: "a-faire",
        truck: "truck1",
        save: jest.fn()
      };

      Trip.findById.mockResolvedValue(tripMock);
      Truck.findById.mockResolvedValue({ status: "disponible", kilometrage: 1000 });
      Pneu.find.mockResolvedValue([]);

      await startTrip(req, res, next);

      expect(tripMock.status).toBe("en-cours");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ======================================================
  // END TRIP
  // ======================================================
  describe("endTrip", () => {
    it("doit refuser si km arrivée < km départ", async () => {
      req.body.kmArrivee = 900;

      Trip.findById.mockResolvedValue({
        status: "en-cours",
        kmDepart: 1000
      });

      await endTrip(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("doit terminer un trajet", async () => {
      req.body.kmArrivee = 1200;

      const tripMock = {
        status: "en-cours",
        kmDepart: 1000,
        truck: "truck1",
        save: jest.fn()
      };

      Trip.findById.mockResolvedValue(tripMock);
      Truck.findById.mockResolvedValue({ kilometrage: 5000, save: jest.fn() });
      Pneu.updateMany.mockResolvedValue({ modifiedCount: 4 });

      await endTrip(req, res, next);

      expect(tripMock.status).toBe("termine");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ======================================================
  // GET TRIP BY DRIVER
  // ======================================================
  describe("getTripByDriver", () => {
    it("doit retourner les trajets du chauffeur connecté", async () => {
      req.user.id = "driver1";

      Trip.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ _id: "trip1" }])
      });

      await getTripByDriver(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });
});
