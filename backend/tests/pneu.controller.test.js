import {
  createPneu,
  getAllPneus,
  getPneuById,
  updatePneu,
  deletePneu
} from "../controllers/Pneu.controller.js";
import Pneu from "../models/Pneu.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";

jest.mock("../models/Pneu.model.js");
jest.mock("../models/Truck.model.js");
jest.mock("../models/Trailer.model.js");

describe("Pneu Controller", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPneu", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: {
          position: "avant_gauche",
          usurePourcentage: 10,
          truck: "truck1",
          trailer: null,
          status: "disponible",
          marque: "Michelin",
          dateInstallation: "2024-01-01"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait créer un pneu avec succès", async () => {
      const mockPneu = {
        _id: "pneu1",
        ...req.body
      };

      Pneu.findOne.mockResolvedValue(null);
      Pneu.create.mockResolvedValue(mockPneu);

      await createPneu(req, res, next);

      expect(Pneu.findOne).toHaveBeenCalledWith({
        position: "avant_gauche",
        truck: "truck1",
        trailer: null
      });
      expect(Pneu.create).toHaveBeenCalledWith({
        position: "avant_gauche",
        usurePourcentage: 10,
        truck: "truck1",
        trailer: null,
        status: "disponible",
        marque: "Michelin",
        lastMaintenance: undefined,
        dateInstallation: "2024-01-01"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Pneu créé avec succès",
        data: mockPneu
      });
    });

    it("devrait renvoyer 400 si un pneu est attaché à la fois à un truck et une trailer", async () => {
      req.body.truck = "truck1";
      req.body.trailer = "trailer1";

      await createPneu(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Un pneu ne peut pas être attaché à la fois à un truck et à une trailer."
      });
      expect(Pneu.create).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 400 si un pneu existe déjà à cette position", async () => {
      Pneu.findOne.mockResolvedValue({ _id: "existingPneu" });

      await createPneu(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Un pneu existe déjà à cette position pour ce véhicule."
      });
      expect(Pneu.create).not.toHaveBeenCalled();
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      Pneu.findOne.mockRejectedValue(error);

      await createPneu(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllPneus", () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait renvoyer la liste des pneus", async () => {
      const mockPneus = [
        { _id: "pneu1", position: "avant_gauche", truck: { immatriculation: "ABC123" } },
        { _id: "pneu2", position: "avant_droit", truck: { immatriculation: "XYZ789" } }
      ];

      const sortMock = jest.fn().mockResolvedValue(mockPneus);
      const populateMock2 = jest.fn().mockReturnValue({ sort: sortMock });
      const populateMock1 = jest.fn().mockReturnValue({ populate: populateMock2 });

      Pneu.find.mockReturnValueOnce(mockPneus);
      Pneu.find.mockReturnValue({ populate: populateMock1 });

      await getAllPneus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Liste des pneus",
        data: mockPneus
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      Pneu.find.mockRejectedValue(error);

      await getAllPneus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getPneuById", () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: { id: "pneu1" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait renvoyer un pneu existant", async () => {
      const mockPneu = {
        _id: "pneu1",
        position: "avant_gauche",
        truck: { immatriculation: "ABC123" }
      };

      const populateMock2 = jest.fn().mockResolvedValue(mockPneu);
      const populateMock1 = jest.fn().mockReturnValue({ populate: populateMock2 });
      Pneu.findById.mockReturnValue({ populate: populateMock1 });

      await getPneuById(req, res, next);

      expect(Pneu.findById).toHaveBeenCalledWith("pneu1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Pneu trouvé",
        data: mockPneu
      });
    });

    it("devrait renvoyer 404 si le pneu n'existe pas", async () => {
      const populateMock2 = jest.fn().mockResolvedValue(null);
      const populateMock1 = jest.fn().mockReturnValue({ populate: populateMock2 });
      Pneu.findById.mockReturnValue({ populate: populateMock1 });

      await getPneuById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Pneu non trouvé"
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      Pneu.findById.mockImplementation(() => {
        throw error;
      });

      await getPneuById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updatePneu", () => {
    let req, res, next, mockPneu;

    beforeEach(() => {
      req = {
        params: { id: "pneu1" },
        body: {
          position: "avant_droit",
          usurePourcentage: 20,
          status: "disponible"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      mockPneu = {
        _id: "pneu1",
        position: "avant_gauche",
        usurePourcentage: 10,
        truck: "truck1",
        trailer: null,
        status: "disponible",
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true)
      };
    });

    it("devrait mettre à jour un pneu avec succès", async () => {
      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([]);

      await updatePneu(req, res, next);

      expect(mockPneu.position).toBe("avant_droit");
      expect(mockPneu.usurePourcentage).toBe(20);
      expect(mockPneu.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Pneu mis à jour avec succès",
        data: mockPneu
      });
    });

    it("devrait renvoyer 400 si un pneu est attaché à la fois à un truck et une trailer", async () => {
      req.body.truck = "truck1";
      req.body.trailer = "trailer1";

      await updatePneu(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Un pneu ne peut pas être attaché à la fois à un truck et à une trailer."
      });
    });

    it("devrait renvoyer 404 si le pneu n'existe pas", async () => {
      Pneu.findById.mockResolvedValue(null);

      await updatePneu(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Pneu non trouvé"
      });
    });

    it("devrait mettre le truck en hors_service si le pneu passe en maintenance", async () => {
      req.body.status = "en_maintenance";
      mockPneu.truck = "truck1";

      Pneu.findById.mockResolvedValue(mockPneu);
      Truck.findByIdAndUpdate.mockResolvedValue({ _id: "truck1", status: "hors_service" });
      Pneu.find.mockResolvedValue([]);

      await updatePneu(req, res, next);

      expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith(
        "truck1",
        { status: "hors_service" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait mettre le trailer en hors_service si le pneu passe en maintenance", async () => {
      req.body.status = "en_maintenance";
      mockPneu.truck = null;
      mockPneu.trailer = "trailer1";

      Pneu.findById.mockResolvedValue(mockPneu);
      Trailer.findByIdAndUpdate.mockResolvedValue({ _id: "trailer1", status: "hors_service" });
      Pneu.find.mockResolvedValue([]);

      await updatePneu(req, res, next);

      expect(Trailer.findByIdAndUpdate).toHaveBeenCalledWith(
        "trailer1",
        { status: "hors_service" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait remettre le truck disponible si tous les pneus sont OK", async () => {
      req.body.status = "disponible";
      mockPneu.status = "en_maintenance";
      mockPneu.truck = "truck1";

      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([]);
      Truck.findByIdAndUpdate.mockResolvedValue({ _id: "truck1", status: "disponible" });

      await updatePneu(req, res, next);

      expect(Pneu.find).toHaveBeenCalledWith({
        truck: "truck1",
        _id: { $ne: "pneu1" },
        status: { $in: ["en_maintenance", "hors_service"] }
      });
      expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith("truck1", { status: "disponible" });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait garder le truck hors_service si d'autres pneus sont problématiques", async () => {
      req.body.status = "disponible";
      mockPneu.status = "en_maintenance";
      mockPneu.truck = "truck1";

      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([{ _id: "pneu2", status: "en_maintenance" }]);

      await updatePneu(req, res, next);

      expect(Truck.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      Pneu.findById.mockRejectedValue(error);

      await updatePneu(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deletePneu", () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: { id: "pneu1" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait supprimer un pneu avec succès", async () => {
      const mockPneu = {
        _id: "pneu1",
        truck: "truck1",
        trailer: null
      };

      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.findByIdAndDelete.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([]);
      Truck.findByIdAndUpdate.mockResolvedValue({ _id: "truck1", status: "disponible" });

      await deletePneu(req, res, next);

      expect(Pneu.findByIdAndDelete).toHaveBeenCalledWith("pneu1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Pneu supprimé avec succès"
      });
    });

    it("devrait renvoyer 404 si le pneu n'existe pas", async () => {
      Pneu.findById.mockResolvedValue(null);

      await deletePneu(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Pneu non trouvé"
      });
      expect(Pneu.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("devrait remettre le truck disponible si aucun pneu problématique restant", async () => {
      const mockPneu = {
        _id: "pneu1",
        truck: "truck1",
        trailer: null
      };

      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.findByIdAndDelete.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([]);
      Truck.findByIdAndUpdate.mockResolvedValue({ _id: "truck1", status: "disponible" });

      await deletePneu(req, res, next);

      expect(Pneu.find).toHaveBeenCalledWith({
        truck: "truck1",
        status: { $in: ["en_maintenance", "hors_service"] }
      });
      expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith("truck1", { status: "disponible" });
    });

    it("devrait remettre le trailer disponible si aucun pneu problématique restant", async () => {
      const mockPneu = {
        _id: "pneu1",
        truck: null,
        trailer: "trailer1"
      };

      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.findByIdAndDelete.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([]);
      Trailer.findByIdAndUpdate.mockResolvedValue({ _id: "trailer1", status: "disponible" });

      await deletePneu(req, res, next);

      expect(Pneu.find).toHaveBeenCalledWith({
        trailer: "trailer1",
        status: { $in: ["en_maintenance", "hors_service"] }
      });
      expect(Trailer.findByIdAndUpdate).toHaveBeenCalledWith("trailer1", { status: "disponible" });
    });

    it("ne devrait pas remettre le truck disponible si des pneus problématiques restent", async () => {
      const mockPneu = {
        _id: "pneu1",
        truck: "truck1",
        trailer: null
      };

      Pneu.findById.mockResolvedValue(mockPneu);
      Pneu.findByIdAndDelete.mockResolvedValue(mockPneu);
      Pneu.find.mockResolvedValue([{ _id: "pneu2", status: "en_maintenance" }]);

      await deletePneu(req, res, next);

      expect(Truck.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      Pneu.findById.mockRejectedValue(error);

      await deletePneu(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
