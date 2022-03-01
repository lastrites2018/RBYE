export const apiUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://rbye-api.vercel.app";
