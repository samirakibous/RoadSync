import {
    createTrip,
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    startTrip,
    endTrip,
    getTripByDriver
} from "../controllers/Trip.controller.js";

import Trip from "../models/Trip.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import User from "../models/User.model.js";

jest.mock("../models/Trip.model.js");
jest.mock("../models/Truck.model.js");
jest.mock("../models/Trailer.model.js");
jest.mock("../models/User.model.js");

describe("Controller - createTrip", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                truck: "t1",
                trailer: "tr1",
                driver: "d1",
                lieuDepart: "A",
                lieuArrivee: "B",
                datDepart: "2025-01-01",
                dateArrivee: "2025-01-02",
                status: "a-faire"
            }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("devrait créer un trajet si camion, remorque et chauffeur valides", async () => {
        Truck.findById.mockResolvedValue({ _id: "t1" });
        Trailer.findById.mockResolvedValue({ _id: "tr1" });
        User.findById.mockResolvedValue({ _id: "d1", role: "driver" });
        Trip.create.mockResolvedValue(req.body);

        await createTrip(req, res, next);

        expect(Trip.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Trajet créé avec succès",
            data: req.body
        });
    });

    it("devrait renvoyer 400 si camion invalide", async () => {
        Truck.findById.mockResolvedValue(null);

        await createTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Camion invalide" });
    });

    it("devrait renvoyer 400 si remorque invalide", async () => {
        Truck.findById.mockResolvedValue({ _id: "t1" });
        Trailer.findById.mockResolvedValue(null);

        await createTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Remorque invalide" });
    });

    it("devrait renvoyer 400 si chauffeur invalide", async () => {
        Truck.findById.mockResolvedValue({ _id: "t1" });
        Trailer.findById.mockResolvedValue({ _id: "tr1" });
        User.findById.mockResolvedValue({ _id: "d1", role: "admin" });

        await createTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Chauffeur invalide" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Truck.findById.mockRejectedValue(new Error("DB Error"));

        await createTrip(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("Controller - getAllTrips", () => {
    let req, res, next;
    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("devrait renvoyer la liste des trajets", async () => {
        const trips = [{ _id: "1" }, { _id: "2" }];

        // Mock complet de la chaîne .find().populate().populate().populate()
        const populateMock = jest.fn().mockReturnThis();
        const populateMock2 = jest.fn().mockReturnThis();
        const populateMock3 = jest.fn().mockResolvedValue(trips);

        Trip.find.mockReturnValue({
            populate: populateMock,
        });
        populateMock.mockReturnValue({
            populate: populateMock2
        });
        populateMock2.mockReturnValue({
            populate: populateMock3
        });

        await getAllTrips(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Liste des trajets",
            data: trips
        });
    });


    it("devrait appeler next en cas d'erreur", async () => {
        const populateMock = jest.fn().mockReturnThis();
        Trip.find.mockReturnValue({ populate: () => { throw new Error("DB Error"); } });

        await getAllTrips(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("Controller - getTripById", () => {
    let req, res, next;
    beforeEach(() => {
        req = { params: { id: "1" } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("devrait renvoyer un trajet existant", async () => {
        const trip = { _id: "1" };

        // Mock complet de la chaine .findById().populate().populate().populate()
        const populate3 = jest.fn().mockResolvedValue(trip);
        const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
        const populate1 = jest.fn().mockReturnValue({ populate: populate2 });

        Trip.findById.mockReturnValue({ populate: populate1 });

        await getTripById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: trip });
    });

    it("devrait renvoyer 404 si non trouvé", async () => {
        const populate3 = jest.fn().mockResolvedValue(null);
        const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
        const populate1 = jest.fn().mockReturnValue({ populate: populate2 });

        Trip.findById.mockReturnValue({ populate: populate1 });

        await getTripById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Trajet non trouvé" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Trip.findById.mockImplementation(() => { throw new Error("DB Error"); });

        await getTripById(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("Controller - updateTrip", () => {
    let req, res, next, mockTrip;
    beforeEach(() => {
        req = { params: { id: "1" }, body: { status: "en-cours" } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        mockTrip = { _id: "1", save: jest.fn().mockResolvedValue(true) };
    });

    it("devrait mettre à jour un trajet existant", async () => {
        Trip.findById.mockResolvedValue(mockTrip);

        await updateTrip(req, res, next);

        expect(mockTrip.status).toBe("en-cours");
        expect(mockTrip.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Trajet mis à jour", data: mockTrip });
    });

    it("devrait renvoyer 404 si trajet non trouvé", async () => {
        Trip.findById.mockResolvedValue(null);

        await updateTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Trajet non trouvé" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Trip.findById.mockRejectedValue(new Error("DB Error"));

        await updateTrip(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("Controller - deleteTrip", () => {
    let req, res, next;
    beforeEach(() => {
        req = { params: { id: "1" } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("devrait supprimer un trajet existant", async () => {
        Trip.findByIdAndDelete.mockResolvedValue({ _id: "1" });

        await deleteTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Trajet supprimé avec succès" });
    });

    it("devrait renvoyer 404 si non trouvé", async () => {
        Trip.findByIdAndDelete.mockResolvedValue(null);

        await deleteTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Trajet non trouvé" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Trip.findByIdAndDelete.mockRejectedValue(new Error("DB Error"));

        await deleteTrip(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});


describe("Controller - startTrip", () => {
    let req, res, next, mockTrip;
    beforeEach(() => {
        req = { params: { id: "1" }, body: { kmDepart: 10, carburantDepart: 50 } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        mockTrip = { _id: "1", status: "a-faire", save: jest.fn().mockResolvedValue(true) };
    });

    it("devrait démarrer un trajet", async () => {
        Trip.findById.mockResolvedValue(mockTrip);

        await startTrip(req, res, next);

        expect(mockTrip.status).toBe("en-cours");
        expect(mockTrip.kmDepart).toBe(10);
        expect(mockTrip.carburantDepart).toBe(50);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Trajet commencé", data: mockTrip });
    });

    it("devrait renvoyer 404 si trajet non trouvé", async () => {
        Trip.findById.mockResolvedValue(null);

        await startTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Trajet non trouvé" });
    });

    it("devrait renvoyer 400 si trajet déjà commencé ou terminé", async () => {
        mockTrip.status = "en-cours";
        Trip.findById.mockResolvedValue(mockTrip);

        await startTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Le trajet a déjà été commencé ou terminé" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Trip.findById.mockRejectedValue(new Error("DB Error"));

        await startTrip(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("Controller - endTrip", () => {
    let req, res, next, mockTrip;
    beforeEach(() => {
        req = { params: { id: "1" }, body: { kmArrivee: 150, carburantArrivee: 20 } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        mockTrip = { _id: "1", status: "en-cours", kmDepart: 100, save: jest.fn().mockResolvedValue(true) };
    });

    it("devrait terminer un trajet correctement", async () => {
        Trip.findById.mockResolvedValue(mockTrip);

        await endTrip(req, res, next);

        expect(mockTrip.status).toBe("termine");
        expect(mockTrip.kmArrivee).toBe(150);
        expect(mockTrip.carburantArrivee).toBe(20);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Trajet terminé", data: mockTrip });
    });

    it("devrait renvoyer 404 si trajet non trouvé", async () => {
        Trip.findById.mockResolvedValue(null);

        await endTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Trajet non trouvé" });
    });

    it("devrait renvoyer 400 si trajet non commencé", async () => {
        mockTrip.status = "a-faire";
        Trip.findById.mockResolvedValue(mockTrip);

        await endTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Impossible de terminer un trajet non commencé" });
    });

    it("devrait renvoyer 400 si kmArrivee < kmDepart", async () => {
        mockTrip.kmDepart = 200;
        Trip.findById.mockResolvedValue(mockTrip);
        req.body.kmArrivee = 150;

        await endTrip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Le kilométrage final ne peut pas être inférieur au kilométrage initial" });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Trip.findById.mockRejectedValue(new Error("DB Error"));

        await endTrip(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("Controller - getTripByDriver", () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { id: "driver123" } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("devrait renvoyer les trajets d'un chauffeur", async () => {
        const trips = [
            { _id: "1", driver: "driver123" },
            { _id: "2", driver: "driver123" }
        ];

        // Mock de la chaîne .populate()
        const populateMock3 = jest.fn().mockResolvedValue(trips); // dernière populate renvoie trips
        const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock3 });
        const populateMock1 = jest.fn().mockReturnValue({ populate: populateMock2 });

        Trip.find.mockReturnValue({ populate: populateMock1 });

        await getTripByDriver(req, res, next);

        expect(Trip.find).toHaveBeenCalledWith({ driver: "driver123" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Mes trajets assignés",
            data: trips
        });
    });

    it("devrait appeler next en cas d'erreur", async () => {
        Trip.find.mockImplementation(() => {
            throw new Error("DB Error");
        });

        await getTripByDriver(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});