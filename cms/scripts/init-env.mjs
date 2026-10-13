// Creates cms/.env from .env.example with fresh random secrets, once.
// Strapi refuses to start with the placeholder "tobemodified" values.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const dir = new URL("../", import.meta.url);
const target = new URL(".env", dir);
if (existsSync(target)) {
  console.log("cms/.env already exists, leaving it as is");
  process.exit(0);
}

const secret = () => randomBytes(16).toString("base64");
const env = readFileSync(new URL(".env.example", dir), "utf8")
  .replace(/"toBeModified1,toBeModified2"/, `"${secret()},${secret()}"`)
  .replace(/tobemodified/g, () => secret());
writeFileSync(target, env);
console.log("cms/.env created with random secrets");
