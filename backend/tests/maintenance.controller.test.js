import { 
  createMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance
} from "../controllers/maintenance.controller.js";

import { MaintenanceService } from "../services/maintenance.services.js";
import { notificationEmitter } from '../events/notificationEmitter.js';

jest.mock("../services/maintenance.services.js");
jest.mock('../events/notificationEmitter.js');

describe("Maintenance Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createMaintenance", () => {
    it("devrait créer une maintenance et émettre un événement", async () => {
      const maintenance = { _id: "m1", resource: "truck1" };
      req.body = { resourceType: "truck", resource: "truck1" };
      MaintenanceService.create.mockResolvedValue(maintenance);

      await createMaintenance(req, res, next);

      expect(MaintenanceService.create).toHaveBeenCalledWith(req.body);
      expect(notificationEmitter.emit).toHaveBeenCalledWith('maintenance_created', {
        maintenanceId: "m1",
        resourceId: "truck1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Maintenance créée avec succès",
        data: maintenance
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      MaintenanceService.create.mockRejectedValue(error);
      await createMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllMaintenances", () => {
    it("devrait renvoyer toutes les maintenances", async () => {
      const maintenances = [{ _id: "m1" }, { _id: "m2" }];
      MaintenanceService.findAll.mockResolvedValue(maintenances);

      await getAllMaintenances(req, res, next);

      expect(MaintenanceService.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: maintenances });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      MaintenanceService.findAll.mockRejectedValue(error);

      await getAllMaintenances(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMaintenanceById", () => {
    it("devrait renvoyer la maintenance si trouvée", async () => {
      const maintenance = { _id: "m1" };
      req.params = { id: "m1" };
      MaintenanceService.findById.mockResolvedValue(maintenance);

      await getMaintenanceById(req, res, next);

      expect(MaintenanceService.findById).toHaveBeenCalledWith("m1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: maintenance });
    });

    it("devrait renvoyer 404 si non trouvée", async () => {
      req.params = { id: "m1" };
      MaintenanceService.findById.mockResolvedValue(null);

      await getMaintenanceById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Maintenance non trouvée" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      req.params = { id: "m1" };
      MaintenanceService.findById.mockRejectedValue(error);

      await getMaintenanceById(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateMaintenance", () => {
    it("devrait mettre à jour et renvoyer la maintenance", async () => {
      const maintenance = { _id: "m1" };
      req.params = { id: "m1" };
      req.body = { notes: "update" };
      MaintenanceService.update.mockResolvedValue(maintenance);

      await updateMaintenance(req, res, next);

      expect(MaintenanceService.update).toHaveBeenCalledWith("m1", req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Maintenance mise à jour",
        data: maintenance
      });
    });

    it("devrait renvoyer 404 si non trouvée", async () => {
      req.params = { id: "m1" };
      MaintenanceService.update.mockResolvedValue(null);

      await updateMaintenance(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Maintenance non trouvée" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      req.params = { id: "m1" };
      req.body = {};
      MaintenanceService.update.mockRejectedValue(error);

      await updateMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteMaintenance", () => {
    it("devrait supprimer et renvoyer succès", async () => {
      req.params = { id: "m1" };
      MaintenanceService.delete.mockResolvedValue({ _id: "m1" });

      await deleteMaintenance(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Maintenance supprimée" });
    });

    it("devrait renvoyer 404 si non trouvée", async () => {
      req.params = { id: "m1" };
      MaintenanceService.delete.mockResolvedValue(null);

      await deleteMaintenance(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Maintenance non trouvée" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      req.params = { id: "m1" };
      MaintenanceService.delete.mockRejectedValue(error);

      await deleteMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("completeMaintenance", () => {
    it("devrait compléter la maintenance et renvoyer succès", async () => {
      const maintenance = { _id: "m1" };
      req.params = { id: "m1" };
      MaintenanceService.completeMaintenance.mockResolvedValue(maintenance);

      await completeMaintenance(req, res, next);

      expect(MaintenanceService.completeMaintenance).toHaveBeenCalledWith("m1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Maintenance terminée avec succès",
        data: maintenance
      });
    });

    it("devrait appeler next en cas d'erreur", async () => {
      const error = new Error("DB Error");
      req.params = { id: "m1" };
      MaintenanceService.completeMaintenance.mockRejectedValue(error);

      await completeMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
