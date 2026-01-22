import React from "react";

export const DetailsModal = ({ cliente, onClose, onUpdate }) => {
  if (!cliente) return null;

  const handlePagoMasivo = async () => {
    // Supongamos que calculas los meses faltantes o es un valor que ya conoces
    const confirmar = window.confirm(`¿Marcar a ${cliente.nombre} como al corriente?`);
    if (confirmar) {
      await onUpdate(cliente._id, 0); // Llamamos a la función del hook
      onClose(); // Cerramos el modal tras actualizar
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation evita que el modal se cierre al hacer click dentro del cuadro blanco */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Detalles del Cliente</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <section className="modal-body">
          <div className="info-grid">
            <div className="info-item">
              <label>Nombre Completo:</label>
              <p>{cliente.nombre}</p>
            </div>
            <div className="info-item">
              <label>Fecha de Registro:</label>
              <p>{new Date(cliente.fechaInicio).toLocaleDateString()}</p>
            </div>
            <div className="info-item">
              <label>Estatus Actual:</label>
              <span className={`status-badge ${cliente.status}`}>
                {cliente.status}
              </span>
            </div>
          </div>

          <div className="payment-section">
            <h3>Gestión de Pagos</h3>
            <p>Si el cliente ha liquidado sus deudas pendientes, pulsa el botón para actualizar su estado global.</p>
            <button className="btn-pago-masivo" onClick={handlePagoMasivo}>
              💰 Marcar como Al Corriente
            </button>
          </div>
        </section>

        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

// Agrega esta línea al final para "blindarlo":
export default DetailsModal;