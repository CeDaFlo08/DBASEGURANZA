import axios from "axios";
import authHeader from "../services/authHeader";

const API_URL = "https://backenddbaseguranza.onrender.com/api/clientes";

export const getClientes = () => {
  return axios.get(API_URL, {
    headers: authHeader()
  });
};

export const createCliente = (data) => {
  return axios.post(API_URL, data, {
    headers: authHeader()
  });
};

export const updateCliente = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, {
    headers: authHeader()
  });
};

export const deleteCliente = (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: authHeader()
  });
};
