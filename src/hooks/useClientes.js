// src/hooks/useClientes.js
import { useState, useEffect } from "react";
import * as api from "../api/clientes";

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false); // <--- Control de carga
  
const cargarClientes = async () => {
  setLoading(true);
  try {
    const res = await api.getClientes();
    setClientes(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false); // <--- Esto es vital para que no se quede el spinner infinito
  }
};
  const eliminarCliente = async (id) => {
    try {
      await api.deleteCliente(id);
      // Actualización optimista: filtras el cliente localmente
      setClientes(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      alert("No se pudo eliminar el cliente");
    }
  };

  const actualizarPagoMasivo = async (id, faltantes) => {
    try {
      const res = await api.ponerAlCorrienteRequest(id, faltantes);
      // Si la API te devuelve el cliente actualizado, lo reemplazas en el estado
      setClientes(prev => prev.map(c => c._id === id ? res.data : c));
    } catch (error) {
      console.error("Error al actualizar pago", error);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  return { clientes, loading, eliminarCliente, actualizarPagoMasivo };
};