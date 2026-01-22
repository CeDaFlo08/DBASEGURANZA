import React from "react";

export const Filters = ({ search, setSearch }) => {
  return (
    <div className="filters-container">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button 
            className="clear-search" 
            onClick={() => setSearch("")}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Aquí podrías agregar en el futuro un select para filtrar por estatus */}
      <div className="filter-stats">
        <span>Filtrando por: <strong>{search || "Todos"}</strong></span>
      </div>
    </div>
  );
};