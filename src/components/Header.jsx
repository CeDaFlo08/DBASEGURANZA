import React from "react";

export const Header = ({ onAddClick }) => {
  // Obtenemos la fecha actual para darle un toque profesional
  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <header className="dashboard-header">
      <div className="header-info">
        <h1>Gestión de Clientes</h1>
        <p className="header-date">{today}</p>
      </div>

      <div className="header-actions">
        {/* Este botón puede abrir un modal de "Nuevo Cliente" más adelante */}
        <button className="btn-add" onClick={onAddClick}>
          <span>+</span> Nuevo Cliente
        </button>
      </div>
    </header>
  );
};