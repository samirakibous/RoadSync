import { MaintenanceService } from "../services/maintenance.services.js"; // Changed from .service to .services
import Maintenance from "../models/Maintenance.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import Pneu from "../models/Pneu.model.js";
import MaintenanceRule from "../models/MaintenanceRule.model.js";
import { notificationEmitter } from "../events/notificationEmitter.js";

jest.mock("../models/Maintenance.model.js");
jest.mock("../models/Truck.model.js");
jest.mock("../models/Trailer.model.js");
jest.mock("../models/Pneu.model.js");
jest.mock("../models/MaintenanceRule.model.js");
jest.mock("../events/notificationEmitter.js");

describe("MaintenanceService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("devrait créer une maintenance pour un truck et mettre son status à en_maintenance", async () => {
      const truck = { _id: "truck1", kilometrage: 1000 };
      Truck.findById.mockResolvedValue(truck);
      Maintenance.create.mockResolvedValue({ _id: "m1", resourceType: "truck" });
      Truck.findByIdAndUpdate.mockResolvedValue({ ...truck, status: "en_maintenance" });

      const data = { resourceType: "truck", resource: "truck1" };
      const result = await MaintenanceService.create(data);

      expect(Truck.findById).toHaveBeenCalledWith("truck1");
      expect(Maintenance.create).toHaveBeenCalledWith(expect.objectContaining({
        resourceType: "truck",
        resource: "truck1",
        kmAtMaintenance: 1000
      }));
      expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith(
        "truck1",
        expect.objectContaining({ status: "en_maintenance" }),
        { new: true }
      );
      expect(result._id).toBe("m1");
    });

    it("devrait lancer une erreur si la ressource est invalide", async () => {
      Truck.findById.mockResolvedValue(null);
      await expect(MaintenanceService.create({ resourceType: "truck", resource: "invalid" }))
        .rejects.toThrow("truck non trouvé");
    });

    it("devrait lancer une erreur si le resourceType est invalide", async () => {
      await expect(MaintenanceService.create({ resourceType: "invalid", resource: "1" }))
        .rejects.toThrow("Type de ressource invalide");
    });

    it("devrait vérifier la règle si fournie et lancer une erreur si non trouvée", async () => {
      const truck = { _id: "truck1", kilometrage: 1000 };
      Truck.findById.mockResolvedValue(truck);
      MaintenanceRule.findById.mockResolvedValue(null);

      await expect(MaintenanceService.create({ resourceType: "truck", resource: "truck1", rule: "rule1" }))
        .rejects.toThrow("Règle de maintenance non trouvée");
    });
  });

  describe("findAll", () => {
    it("devrait appeler Maintenance.find et populate", async () => {
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue([{ _id: "m1" }]);
      Maintenance.find.mockReturnValue({ populate: mockPopulate });
      mockPopulate.mockReturnValue({ populate: mockPopulate, sort: mockSort });

      const result = await MaintenanceService.findAll();
      expect(Maintenance.find).toHaveBeenCalled();
      expect(result).toEqual([{ _id: "m1" }]);
    });
  });

  describe("findById", () => {
    it("devrait trouver une maintenance par id", async () => {
      const mockPopulate2 = jest.fn().mockResolvedValue({ _id: "m1" });
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Maintenance.findById.mockReturnValue({ populate: mockPopulate1 });

      const result = await MaintenanceService.findById("m1");
      expect(Maintenance.findById).toHaveBeenCalledWith("m1");
      expect(result._id).toBe("m1");
    });
  });

  describe("delete", () => {
    it("devrait supprimer une maintenance et remettre la ressource disponible", async () => {
      const maintenance = { _id: "m1", resourceType: "truck", resource: "truck1" };
      Maintenance.findById.mockResolvedValue(maintenance);
      Truck.findByIdAndUpdate.mockResolvedValue({ _id: "truck1", status: "disponible" });
      Maintenance.findByIdAndDelete.mockResolvedValue(maintenance);

      const result = await MaintenanceService.delete("m1");
      expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith("truck1", { status: "disponible" }, { new: true });
      expect(result._id).toBe("m1");
    });
  });

  describe("completeMaintenance", () => {
    it("devrait marquer la maintenance comme completed et remettre la ressource disponible", async () => {
      const maintenance = { _id: "m1", resourceType: "truck", resource: { _id: "truck1" }, save: jest.fn() };
      const mockPopulate = jest.fn().mockResolvedValue(maintenance);
      Maintenance.findById.mockReturnValue({ populate: mockPopulate });
      Truck.findByIdAndUpdate.mockResolvedValue({ _id: "truck1", status: "disponible" });

      const result = await MaintenanceService.completeMaintenance("m1");
      expect(maintenance.status).toBe("completed");
      expect(Truck.findByIdAndUpdate).toHaveBeenCalledWith("truck1", { status: "disponible" });
      expect(result._id).toBe("m1");
    });
  });

  describe("notifyDueVidanges", () => {
    it("devrait émettre une notification si maintenance due", async () => {
      const maintenance = {
        _id: "m1",
        resourceType: "truck",
        kmAtMaintenance: 100,
        status: "completed",
        resource: { _id: "truck1", kilometrage: 200, immatriculation: "ABC123" },
        rule: { intervalKm: 50, action: "vidange" }
      };

      const mockPopulate2 = jest.fn().mockResolvedValue([maintenance]);
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Maintenance.find.mockReturnValue({ populate: mockPopulate1 });
      Maintenance.distinct.mockResolvedValue(["truck1"]);
      Truck.find.mockResolvedValue([]);
      MaintenanceRule.findOne.mockResolvedValue({ intervalKm: 50, action: "vidange", active: true });

      await MaintenanceService.notifyDueVidanges();

      expect(notificationEmitter.emit).toHaveBeenCalled();
    });
  });
});
