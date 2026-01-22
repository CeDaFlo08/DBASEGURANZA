import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const login = (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};
