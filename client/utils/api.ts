import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://the-farm-brothers.onrender.com";

// Configure default base URL for axios
if (typeof window !== "undefined") {
  axios.defaults.baseURL = API_BASE_URL;
}
