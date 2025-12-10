import mongoose from "mongoose";
import User from "../models/User.model.js";
import { createDriverAndSendEmail } from ".././services/user.services.js";
import * as emailUtil from ".././utils/sendEmail.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

jest.mock(".././utils/sendEmail.js");

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe("Service - createDriverAndSendEmail", () => {
  it("devrait créer un chauffeur avec mot de passe temporaire", async () => {
    emailUtil.default.mockResolvedValue(true);

    const driver = await createDriverAndSendEmail({
      name: "alex",
      email: "alex@test.com"
    });

    expect(driver).toHaveProperty("_id");
    expect(driver.name).toBe("alex");
    expect(driver.role).toBe("driver");
    expect(driver.mustChangePassword).toBe(true);

    const dbUser = await User.findOne({ email: "alex@test.com" });
    expect(dbUser).not.toBeNull();
  });

  it("devrait refuser un email déjà existant", async () => {
    emailUtil.default.mockResolvedValue(true);

    await createDriverAndSendEmail({ name: "alex", email: "dup@test.com" });

    await expect(
      createDriverAndSendEmail({ name: "Dup", email: "dup@test.com" })
    ).rejects.toThrow();
  });
});
