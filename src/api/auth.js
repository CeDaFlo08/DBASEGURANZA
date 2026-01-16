import axios from "axios";

const API_URL = "https://backenddbaseguranza.onrender.com/api/auth";

export const login = (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};
