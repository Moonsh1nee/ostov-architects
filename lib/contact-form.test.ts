import { describe, expect, it } from "vitest";
import { type ContactValues, validateContact } from "./contact-form";

const TYPES = ["residential", "public", "interior"];
const valid: ContactValues = {
  name: "Анна",
  email: "anna@example.com",
  phone: "",
  type: "residential",
  message: "Дом на участке 15 соток, около 200 м²",
  consent: true,
};

describe("validateContact", () => {
  it("accepts a complete form with an empty optional phone", () => {
    expect(validateContact(valid, TYPES)).toEqual({});
  });

  it("reports every problem at once", () => {
    const errors = validateContact(
      { name: " ", email: "", phone: "12", type: "", message: "short", consent: false },
      TYPES,
    );
    expect(errors).toEqual({
      name: "nameRequired",
      email: "emailRequired",
      phone: "phoneInvalid",
      type: "typeRequired",
      message: "messageShort",
      consent: "consentRequired",
    });
  });

  it.each(["anna@", "anna example.com", "anna@example"])("rejects malformed email %s", (email) => {
    expect(validateContact({ ...valid, email }, TYPES).email).toBe("emailInvalid");
  });

  it("counts only digits in the phone number", () => {
    expect(validateContact({ ...valid, phone: "+7 (495) 000-00-00" }, TYPES).phone).toBeUndefined();
  });

  it("rejects a project type outside the allowed list", () => {
    expect(validateContact({ ...valid, type: "industrial" }, TYPES).type).toBe("typeRequired");
  });
});
