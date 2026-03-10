const envApiUrl = process.env.RBYE_API_URL || process.env.NEXT_PUBLIC_API_URL;
const envApiPort = process.env.RBYE_API_PORT || process.env.NEXT_PUBLIC_API_PORT;

export const apiUrl =
  process.env.NODE_ENV === "development"
    ? envApiUrl || `http://localhost:${envApiPort || "5000"}`
    : "https://rbye-api.vercel.app";
