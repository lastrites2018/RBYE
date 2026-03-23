// 책임: 환경에 따라 올바른 API URL을 반환한다
import { describe, test, expect, beforeEach, afterEach } from "bun:test";

describe("apiUrl", () => {
  const env = process.env as Record<string, string | undefined>;
  const originalEnv = { ...env };

  beforeEach(() => {
    // 모듈 캐시 초기화 — 환경변수 변경이 반영되도록
    delete require.cache[require.resolve("../utils/apiLocation")];
  });

  afterEach(() => {
    Object.keys(env).forEach((key) => {
      delete env[key];
    });
    Object.assign(env, originalEnv);
  });

  test("production 환경에서는 rbye-api.vercel.app을 반환한다", async () => {
    env.NODE_ENV = "production";
    delete require.cache[require.resolve("../utils/apiLocation")];
    const { apiUrl } = await import("../utils/apiLocation");
    expect(apiUrl).toBe("https://rbye-api.vercel.app");
  });

  test("development 환경에서 환경변수 없으면 localhost:5000을 반환한다", async () => {
    env.NODE_ENV = "development";
    delete env.RBYE_API_URL;
    delete env.NEXT_PUBLIC_API_URL;
    delete env.RBYE_API_PORT;
    delete env.NEXT_PUBLIC_API_PORT;
    delete require.cache[require.resolve("../utils/apiLocation")];
    const { apiUrl } = await import("../utils/apiLocation");
    expect(apiUrl).toBe("http://localhost:5000");
  });

  test("development 환경에서 RBYE_API_URL이 있으면 해당 URL을 반환한다", async () => {
    env.NODE_ENV = "development";
    env.RBYE_API_URL = "http://custom-api:3000";
    delete env.RBYE_API_PORT;
    delete env.NEXT_PUBLIC_API_PORT;
    delete require.cache[require.resolve("../utils/apiLocation")];
    const { apiUrl } = await import("../utils/apiLocation");
    expect(apiUrl).toBe("http://custom-api:3000");
  });

  test("development 환경에서 커스텀 포트를 반영한다", async () => {
    env.NODE_ENV = "development";
    delete env.RBYE_API_URL;
    delete env.NEXT_PUBLIC_API_URL;
    env.RBYE_API_PORT = "5003";
    delete require.cache[require.resolve("../utils/apiLocation")];
    const { apiUrl } = await import("../utils/apiLocation");
    expect(apiUrl).toBe("http://localhost:5003");
  });
});
