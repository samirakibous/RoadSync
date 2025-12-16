import {
  createFuelLog,
  getAllFuelLogs,
  getMyFuelLogs,
  getFuelLogByTrip,
  deleteFuelLog
} from "../controllers/fuelLog.controller.js";
import FuelLog from "../models/FuelLog.model.js";

jest.mock("../models/FuelLog.model.js");

describe("FuelLog Controller", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFuelLog", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          trip: "trip1",
          montant: 150.50
        },
        file: null
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait créer un fuel log sans fichier", async () => {
      const mockFuelLog = {
        _id: "fuelLog1",
        trip: "trip1",
        montant: 150.50,
        factureUrl: null,
        factureType: null
      };

      FuelLog.create.mockResolvedValue(mockFuelLog);

      await createFuelLog(req, res);

      expect(FuelLog.create).toHaveBeenCalledWith({
        trip: "trip1",
        montant: 150.50,
        factureUrl: null,
        factureType: null
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fuel log créé avec succès",
        data: mockFuelLog
      });
    });

    it("devrait créer un fuel log avec une image", async () => {
      req.file = {
        filename: "facture123.jpg",
        mimetype: "image/jpeg"
      };

      const mockFuelLog = {
        _id: "fuelLog1",
        trip: "trip1",
        montant: 150.50,
        factureUrl: "/uploads/fuelLogs/facture123.jpg",
        factureType: "image"
      };

      FuelLog.create.mockResolvedValue(mockFuelLog);

      await createFuelLog(req, res);

      expect(FuelLog.create).toHaveBeenCalledWith({
        trip: "trip1",
        montant: 150.50,
        factureUrl: "/uploads/fuelLogs/facture123.jpg",
        factureType: "image"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fuel log créé avec succès",
        data: mockFuelLog
      });
    });

    it("devrait créer un fuel log avec un PDF", async () => {
      req.file = {
        filename: "facture123.pdf",
        mimetype: "application/pdf"
      };

      const mockFuelLog = {
        _id: "fuelLog1",
        trip: "trip1",
        montant: 150.50,
        factureUrl: "/uploads/fuelLogs/facture123.pdf",
        factureType: "pdf"
      };

      FuelLog.create.mockResolvedValue(mockFuelLog);

      await createFuelLog(req, res);

      expect(FuelLog.create).toHaveBeenCalledWith({
        trip: "trip1",
        montant: 150.50,
        factureUrl: "/uploads/fuelLogs/facture123.pdf",
        factureType: "pdf"
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("devrait renvoyer 500 en cas d'erreur", async () => {
      const error = new Error("DB Error");
      FuelLog.create.mockRejectedValue(error);

      await createFuelLog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error"
      });
    });
  });

  describe("getAllFuelLogs", () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait renvoyer la liste des fuel logs", async () => {
      const mockFuelLogs = [
        {
          _id: "fuelLog1",
          trip: {
            lieuDepart: "Paris",
            lieuArrivee: "Lyon",
            driver: { name: "John Doe", email: "john@example.com" }
          },
          montant: 150.50
        },
        {
          _id: "fuelLog2",
          trip: {
            lieuDepart: "Lyon",
            lieuArrivee: "Marseille",
            driver: { name: "Jane Doe", email: "jane@example.com" }
          },
          montant: 200.00
        }
      ];

      const sortMock = jest.fn().mockResolvedValue(mockFuelLogs);
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      FuelLog.find.mockReturnValue({ populate: populateMock });

      await getAllFuelLogs(req, res);

      expect(FuelLog.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFuelLogs
      });
    });

    it("devrait renvoyer 500 en cas d'erreur", async () => {
      const error = new Error("DB Error");
      FuelLog.find.mockImplementation(() => {
        throw error;
      });

      await getAllFuelLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error"
      });
    });
  });

  describe("getMyFuelLogs", () => {
    let req, res;

    beforeEach(() => {
      req = {
        user: {
          id: "driver1"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait renvoyer les fuel logs du chauffeur connecté", async () => {
      const mockFuelLogs = [
        {
          _id: "fuelLog1",
          trip: {
            lieuDepart: "Paris",
            lieuArrivee: "Lyon",
            driver: { _id: "driver1", name: "John Doe", email: "john@example.com" }
          },
          montant: 150.50
        },
        {
          _id: "fuelLog2",
          trip: {
            lieuDepart: "Lyon",
            lieuArrivee: "Marseille",
            driver: { _id: "driver1", name: "John Doe", email: "john@example.com" }
          },
          montant: 200.00
        }
      ];

      const sortMock = jest.fn().mockResolvedValue(mockFuelLogs);
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      FuelLog.find.mockReturnValue({ populate: populateMock });

      await getMyFuelLogs(req, res);

      expect(FuelLog.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFuelLogs
      });
    });

    it("devrait filtrer les fuel logs avec trip null", async () => {
      const mockFuelLogs = [
        {
          _id: "fuelLog1",
          trip: {
            lieuDepart: "Paris",
            driver: { _id: "driver1", name: "John Doe" }
          },
          montant: 150.50
        },
        {
          _id: "fuelLog2",
          trip: null, // Trip ne correspond pas au driver
          montant: 200.00
        }
      ];

      const sortMock = jest.fn().mockResolvedValue(mockFuelLogs);
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      FuelLog.find.mockReturnValue({ populate: populateMock });

      await getMyFuelLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockFuelLogs[0]] // Seulement le premier
      });
    });

    it("devrait renvoyer 500 en cas d'erreur", async () => {
      const error = new Error("DB Error");
      FuelLog.find.mockImplementation(() => {
        throw error;
      });

      await getMyFuelLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error"
      });
    });
  });

  describe("getFuelLogByTrip", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: {
          id: "trip1"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait renvoyer les fuel logs d'un trip spécifique", async () => {
      const mockFuelLogs = [
        {
          _id: "fuelLog1",
          trip: {
            _id: "trip1",
            lieuDepart: "Paris",
            lieuArrivee: "Lyon",
            driver: { name: "John Doe", email: "john@example.com" }
          },
          montant: 150.50
        },
        {
          _id: "fuelLog2",
          trip: {
            _id: "trip1",
            lieuDepart: "Paris",
            lieuArrivee: "Lyon",
            driver: { name: "John Doe", email: "john@example.com" }
          },
          montant: 100.00
        }
      ];

      const populateMock = jest.fn().mockResolvedValue(mockFuelLogs);
      FuelLog.find.mockReturnValue({ populate: populateMock });

      await getFuelLogByTrip(req, res);

      expect(FuelLog.find).toHaveBeenCalledWith({ trip: "trip1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFuelLogs
      });
    });

    it("devrait renvoyer un tableau vide si aucun fuel log trouvé", async () => {
      const populateMock = jest.fn().mockResolvedValue([]);
      FuelLog.find.mockReturnValue({ populate: populateMock });

      await getFuelLogByTrip(req, res);

      expect(FuelLog.find).toHaveBeenCalledWith({ trip: "trip1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it("devrait renvoyer 500 en cas d'erreur", async () => {
      const error = new Error("DB Error");
      FuelLog.find.mockImplementation(() => {
        throw error;
      });

      await getFuelLogByTrip(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error"
      });
    });
  });

  describe("deleteFuelLog", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: {
          id: "fuelLog1"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait supprimer un fuel log avec succès", async () => {
      FuelLog.findByIdAndDelete.mockResolvedValue({
        _id: "fuelLog1",
        trip: "trip1",
        montant: 150.50
      });

      await deleteFuelLog(req, res);

      expect(FuelLog.findByIdAndDelete).toHaveBeenCalledWith("fuelLog1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fuel log supprimé avec succès"
      });
    });

    it("devrait renvoyer 500 en cas d'erreur", async () => {
      const error = new Error("DB Error");
      FuelLog.findByIdAndDelete.mockRejectedValue(error);

      await deleteFuelLog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error"
      });
    });
  });
});
