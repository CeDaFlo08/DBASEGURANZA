import React from "react";
// Importas el helper que ya tenías para calcular fechas
import { getNextDueDate } from "../utils/clienteHelpers";

export const ClienteRow = ({ cliente, onOpenDetails, onDelete }) => {
  const { nombre, fechaInicio, status } = cliente;

  // Calculamos la fecha usando tu helper
  const proximoPago = getNextDueDate(fechaInicio);

  return (
    <tr className="cliente-row">
      <td className="cliente-nombre">
        <strong>{nombre}</strong>
      </td>
      
      <td>
        <span className={`status-badge ${status}`}>
          {status === "al-corriente" ? "Al Corriente" : "Pendiente"}
        </span>
      </td>

      <td className="fecha-pago">
        {proximoPago}
      </td>

      <td className="acciones">
        <button 
          className="btn-icon btn-details" 
          onClick={onOpenDetails}
          title="Ver detalles"
        >
          👁️ Ver
        </button>
        
        <button 
          className="btn-icon btn-delete" 
          onClick={() => {
            if (window.confirm(`¿Eliminar a ${nombre}?`)) {
              onDelete();
            }
          }}
          title="Eliminar cliente"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};