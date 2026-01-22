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

// 🔹 CORREGIDO: Ahora usa la URL completa y envía el token de seguridad
export const registrarPagoRequest = (id, pagoData) => {
  return axios.patch(`${API_URL}/${id}/registrar-pago`, pagoData, {
    headers: authHeader()
  });
};

export const deleteCliente = (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: authHeader()
  });
};

export const ponerAlCorrienteRequest = (id, meses) => 
  axios.patch(`${API_URL}/${id}/poner-al-corriente`, { mesesFaltantes: meses }, {
    headers: authHeader()
  });

export const eliminarUltimoPagoRequest = (id) => 
  axios.patch(`${API_URL}/${id}/eliminar-ultimo-pago`, {}, {
    headers: authHeader()
  });