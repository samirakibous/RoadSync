import {
  createMaintenanceRule,
  getAllMaintenanceRules,
  getMaintenanceRuleById,
  updateMaintenanceRule,
  deleteMaintenanceRule
} from "../controllers/maintenanceRule.controller.js";
import MaintenanceRule from "../models/MaintenanceRule.model.js";
import { maintenanceRuleSchema } from "../validations/MaintenanceRole.js";

jest.mock("../models/MaintenanceRule.model.js");
jest.mock("../validations/MaintenanceRole.js");

describe("MaintenanceRule Controller", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMaintenanceRule", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: {
          type: "truck",
          action: "vidange",
          intervalKm: 10000,
          intervalDays: 365,
          description: "Vidange moteur",
          active: true
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait créer une règle de maintenance avec succès", async () => {
      const mockRule = {
        _id: "rule123",
        ...req.body
      };

      maintenanceRuleSchema.validate = jest.fn().mockResolvedValue(req.body);
      MaintenanceRule.create.mockResolvedValue(mockRule);

      await createMaintenanceRule(req, res, next);

      expect(maintenanceRuleSchema.validate).toHaveBeenCalledWith(req.body, { abortEarly: false });
      expect(MaintenanceRule.create).toHaveBeenCalledWith({
        type: "truck",
        action: "vidange",
        intervalKm: 10000,
        intervalDays: 365,
        description: "Vidange moteur",
        active: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Règle de maintenance créée avec succès",
        data: mockRule
      });
    });

    it("devrait appeler next en cas d'erreur de validation", async () => {
      const validationError = new Error("Validation failed");

      maintenanceRuleSchema.validate = jest
        .fn()
        .mockRejectedValue(validationError);

      await createMaintenanceRule(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
      expect(MaintenanceRule.create).not.toHaveBeenCalled();
    });


    it("devrait appeler next en cas d'erreur de création", async () => {
      const dbError = new Error("DB Error");
      maintenanceRuleSchema.validate = jest.fn().mockResolvedValue(req.body);
      MaintenanceRule.create.mockRejectedValue(dbError);

      await createMaintenanceRule(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
    });
  });

  describe("getAllMaintenanceRules", () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait renvoyer la liste des règles de maintenance", async () => {
      const mockRules = [
        {
          _id: "rule1",
          type: "truck",
          action: "vidange",
          intervalKm: 10000,
          intervalDays: 365,
          active: true
        },
        {
          _id: "rule2",
          type: "trailer",
          action: "revision",
          intervalKm: 15000,
          intervalDays: 180,
          active: true
        }
      ];

      MaintenanceRule.find.mockResolvedValue(mockRules);

      await getAllMaintenanceRules(req, res, next);

      expect(MaintenanceRule.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Liste des règles de maintenance",
        data: mockRules
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      MaintenanceRule.find.mockRejectedValue(error);

      await getAllMaintenanceRules(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMaintenanceRuleById", () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: { id: "rule123" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait renvoyer une règle existante", async () => {
      const mockRule = {
        _id: "rule123",
        type: "truck",
        action: "vidange",
        intervalKm: 10000,
        intervalDays: 365,
        active: true
      };

      MaintenanceRule.findById.mockResolvedValue(mockRule);

      await getMaintenanceRuleById(req, res, next);

      expect(MaintenanceRule.findById).toHaveBeenCalledWith("rule123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRule
      });
    });

    it("devrait renvoyer 404 si la règle n'existe pas", async () => {
      MaintenanceRule.findById.mockResolvedValue(null);

      await getMaintenanceRuleById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Règle de maintenance non trouvée"
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      MaintenanceRule.findById.mockRejectedValue(error);

      await getMaintenanceRuleById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateMaintenanceRule", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        params: { id: "rule123" },
        body: {
          type: "truck",
          action: "vidange",
          intervalKm: 12000,
          intervalDays: 400,
          active: true
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait mettre à jour une règle existante", async () => {
      const mockUpdatedRule = {
        _id: "rule123",
        ...req.body
      };

      maintenanceRuleSchema.validate = jest.fn().mockResolvedValue(req.body);
      MaintenanceRule.findByIdAndUpdate.mockResolvedValue(mockUpdatedRule);

      await updateMaintenanceRule(req, res, next);

      expect(maintenanceRuleSchema.validate).toHaveBeenCalledWith(req.body, { abortEarly: false });
      expect(MaintenanceRule.findByIdAndUpdate).toHaveBeenCalledWith(
        "rule123",
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Règle de maintenance mise à jour",
        data: mockUpdatedRule
      });
    });

    it("devrait renvoyer 404 si la règle n'existe pas", async () => {
      maintenanceRuleSchema.validate = jest.fn().mockResolvedValue(req.body);
      MaintenanceRule.findByIdAndUpdate.mockResolvedValue(null);

      await updateMaintenanceRule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Règle de maintenance non trouvée"
      });
    });

    it("devrait appeler next en cas d'erreur de validation", async () => {
      const validationError = new Error("Validation failed");

      maintenanceRuleSchema.validate = jest
        .fn()
        .mockRejectedValue(validationError);

      await updateMaintenanceRule(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
      expect(MaintenanceRule.findByIdAndUpdate).not.toHaveBeenCalled();
    });


    it("devrait appeler next en cas d'erreur de mise à jour", async () => {
      const dbError = new Error("DB Error");
      maintenanceRuleSchema.validate = jest.fn().mockResolvedValue(req.body);
      MaintenanceRule.findByIdAndUpdate.mockRejectedValue(dbError);

      await updateMaintenanceRule(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
    });
  });

  describe("deleteMaintenanceRule", () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: { id: "rule123" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it("devrait supprimer une règle existante", async () => {
      const mockDeletedRule = {
        _id: "rule123",
        type: "truck",
        action: "vidange"
      };

      MaintenanceRule.findByIdAndDelete.mockResolvedValue(mockDeletedRule);

      await deleteMaintenanceRule(req, res, next);

      expect(MaintenanceRule.findByIdAndDelete).toHaveBeenCalledWith("rule123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Règle de maintenance supprimée avec succès"
      });
    });

    it("devrait renvoyer 404 si la règle n'existe pas", async () => {
      MaintenanceRule.findByIdAndDelete.mockResolvedValue(null);

      await deleteMaintenanceRule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Règle de maintenance non trouvée"
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      MaintenanceRule.findByIdAndDelete.mockRejectedValue(error);

      await deleteMaintenanceRule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});