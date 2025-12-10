import { 
  createTrailer, 
  getAllTrailers, 
  getTrailerById, 
  updateTrailer, 
  deleteTrailer 
} from "../controllers/trailer.controller.js";
import Trailer from "../models/Trailer.model.js";

jest.mock("../models/Trailer.model.js");

describe("Controller - createTrailer", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { plateNumber: "TR123", type: "Flatbed", maxLoad: 10000, status: "active", purchaseDate: "2025-01-01", lastMaintenance: "2025-06-01" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait créer une remorque si le numéro de plaque n'existe pas", async () => {
    Trailer.findOne.mockResolvedValue(null);
    Trailer.create.mockResolvedValue(req.body);

    await createTrailer(req, res, next);

    expect(Trailer.findOne).toHaveBeenCalledWith({ plateNumber: "TR123" });
    expect(Trailer.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Remorque créée avec succès",
      data: req.body
    });
  });

  it("devrait renvoyer 400 si la remorque existe déjà", async () => {
    Trailer.findOne.mockResolvedValue({ plateNumber: "TR123" });

    await createTrailer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Remorque déjà existante avec ce numéro de plaque"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Trailer.findOne.mockRejectedValue(new Error("DB Error"));

    await createTrailer(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - getAllTrailers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait renvoyer la liste des remorques", async () => {
    const trailers = [{ plateNumber: "TR123" }, { plateNumber: "TR456" }];
    Trailer.find.mockResolvedValue(trailers);

    await getAllTrailers(req, res, next);

    expect(Trailer.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Liste des remorques",
      data: trailers
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Trailer.find.mockRejectedValue(new Error("DB Error"));

    await getAllTrailers(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
describe("Controller - getTrailerById", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait renvoyer une remorque existante", async () => {
    const trailer = { _id: "1", plateNumber: "TR123" };
    Trailer.findById.mockResolvedValue(trailer);

    await getTrailerById(req, res, next);

    expect(Trailer.findById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: trailer
    });
  });

  it("devrait renvoyer 404 si la remorque n'existe pas", async () => {
    Trailer.findById.mockResolvedValue(null);

    await getTrailerById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Remorque non trouvée"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Trailer.findById.mockRejectedValue(new Error("DB Error"));

    await getTrailerById(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - updateTrailer", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: "1" }, body: { status: "inactive" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait mettre à jour une remorque existante", async () => {
    const updatedTrailer = { _id: "1", status: "inactive" };
    Trailer.findByIdAndUpdate.mockResolvedValue(updatedTrailer);

    await updateTrailer(req, res, next);

    expect(Trailer.findByIdAndUpdate).toHaveBeenCalledWith("1", req.body, { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Remorque mise à jour avec succès",
      data: updatedTrailer
    });
  });

  it("devrait renvoyer 404 si la remorque n'existe pas", async () => {
    Trailer.findByIdAndUpdate.mockResolvedValue(null);

    await updateTrailer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Remorque non trouvée"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Trailer.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

    await updateTrailer(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Controller - deleteTrailer", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("devrait supprimer une remorque existante", async () => {
    Trailer.findByIdAndDelete.mockResolvedValue({ _id: "1" });

    await deleteTrailer(req, res, next);

    expect(Trailer.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Remorque supprimée avec succès"
    });
  });

  it("devrait renvoyer 404 si la remorque n'existe pas", async () => {
    Trailer.findByIdAndDelete.mockResolvedValue(null);

    await deleteTrailer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Remorque non trouvée"
    });
  });

  it("devrait appeler next en cas d'erreur", async () => {
    Trailer.findByIdAndDelete.mockRejectedValue(new Error("DB Error"));

    await deleteTrailer(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
