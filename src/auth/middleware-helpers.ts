import type { Env } from "../../worker-configuration";

export const initialize = (db: D1Database, env: Env) => {
  const sessionCookieName = "auth_session";
  const d1Adapter = d1(db, {
    key: "user_keys",
    user: "users",
    session: "user_sessions",
  });

  const auth = lucia({
    env: env.ENVIRONMENT === "development" ? "DEV" : "PROD", // "PROD" if deployed to HTTPS,
    middleware: hono(),
    adapter: sonicAdapter(d1Adapter, env.KVDATA),
    getUserAttributes: (data) => {
      return {
        email: data.email,
        role: data.role,
      };
    },
    passwordHash: {
      async generate(userPassword) {
        const salt = await generateRandomString(16);

        const hash = await hashPassword(
          userPassword,
          env.AUTH_KDF,
          salt,
          getIterations(env.AUTH_ITERATIONS),
          env.AUTH_HASH
        );
        if (hash.kdf === "pbkdf2") {
          return `snc:$:${hash.hashedPassword}:$:${salt}:$:${hash.hash}:$:${hash.iterations}`;
        } else {
          return `lca:$:${hash.hashedPassword}`;
        }
      },
      async validate(userPassword, dbHash) {
        const [hasher, hashedPassword, salt, hash, iterations] =
          dbHash.split(":$:");

        let kdf: Bindings["AUTH_KDF"] = "pbkdf2";
        if (hasher === "lca") {
          kdf = "scrypt";
        }
        if (kdf === "pbkdf2") {
          const verifyHash = await hashPassword(
            userPassword,
            kdf,
            salt,
            getIterations(iterations),
            hash
          );
          return constantTimeEqual(verifyHash.hashedPassword, hashedPassword);
        } else {
          return await validateLuciaPasswordHash(
            userPassword,
            dbHash.substring(4)
          );
        }
      },
    },
  });
  return auth;
};
