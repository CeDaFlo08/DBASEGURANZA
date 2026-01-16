import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../api/clientes";
import "./Dashboard.css";
// ============== COMPONENTE DE BARRA DE BUSQUEDA ==============
import { Searchbar } from "../components/elements/Searchbar";
// ================ PDF EXPORT ===============

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ... resto de imports y código ...

// Planes EXACTOS
const PLANES = {
  1: "GMM (Gastos Médicos Mayores)",
  2: "Primordial",
  3: "MetaLife",
  4: "EducaLife",
  5: "FlexiInversion",
  6: "TotalLife",
  7: "PerfectLife",
  8: "TempoLife"
};

//Lista de frecuencias
const FRECUENCIAS = ["ANUAL", "SEMESTRAL", "TRIMESTRAL", "MENSUAL"];

//lista de meses
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [clienteToCancel, setClienteToCancel] = useState(null);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [clienteToChange, setClienteToChange] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const initialForm = {
    nombre: "",
    numPoliza: "",
    trad: "",
    rfc: "",
    fechaNacimiento: "",
    fechaIngreso: "",
    cantidadPago: "",
    plan: "",
    frecuenciaPago: "",
    estado: "AL_CORRIENTE"
  };

  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [planFiltro, setPlanFiltro] = useState("");
  const [frecuenciaFiltro, setFrecuenciaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  // ===== FILTROS EXTRA =====
  const [mesNacimientoFiltro, setMesNacimientoFiltro] = useState("");
  const [mesIngresoFiltro, setMesIngresoFiltro] = useState("");
  const [diaFiltro, setDiaFiltro] = useState("");

  const today = new Date();

  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== date.getDate()) {
      d.setDate(0);
    }
    return d;
  };

  const getNextDueDate = (fechaIngreso, frecuencia, status) => {
    const start = new Date(fechaIngreso);
    let current = new Date(start);
    let lastDue = new Date(start);
    while (current <= today) {
      lastDue = new Date(current);
      switch (frecuencia) {
        case 'MENSUAL':
          current = addMonths(current, 1);
          break;
        case 'TRIMESTRAL':
          current = addMonths(current, 3);
          break;
        case 'SEMESTRAL':
          current = addMonths(current, 6);
          break;
        case 'ANUAL':
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          return null;
      }
    }
    if (status === 'PENDIENTE') {
      return lastDue; // the last due date <= today
    } else {
      return current; // the next due date > today
    }
  };


  // =============================
  // Cargar clientes
  // =============================
  const cargarClientes = async () => {
    try {
      const res = await getClientes();
      let clientesData = res.data;

      // Verificar y actualizar estados automáticamente
      for (let c of clientesData) {
        const nextDue = getNextDueDate(c.fechaIngreso, c.frecuenciaPago, c.estado);
        if (nextDue < today && c.estado === 'AL_CORRIENTE') {
          // Actualizar a PENDIENTE
          try {
            await updateCliente(c._id, { estado: 'PENDIENTE' });
            c.estado = 'PENDIENTE'; // actualizar localmente
          } catch (error) {
            console.error("Error al actualizar estado automático", error);
          }
        }
      }

      setClientes(clientesData);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // =============================
  // Manejo de formulario
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombre.trim()) { alert("El nombre es requerido"); return; }
    if (!form.numPoliza || isNaN(Number(form.numPoliza))) { alert("Número de póliza inválido"); return; }
    if (!form.trad.trim()) { alert("TRAD es requerido"); return; }
    if (!form.rfc.trim()) { alert("RFC es requerido"); return; }
    if (!form.fechaNacimiento || isNaN(new Date(form.fechaNacimiento).getTime())) { alert("Fecha de nacimiento inválida"); return; }
    if (!form.fechaIngreso || isNaN(new Date(form.fechaIngreso).getTime())) { alert("Fecha de ingreso inválida"); return; }
    if (!form.cantidadPago || isNaN(Number(form.cantidadPago)) || Number(form.cantidadPago) <= 0) { alert("Cantidad de pago inválida"); return; }
    if (!form.plan || ![1,2,3,4,5,6,7,8].includes(Number(form.plan))) { alert("Plan inválido"); return; }
    if (!form.frecuenciaPago || !FRECUENCIAS.includes(form.frecuenciaPago)) { alert("Frecuencia de pago inválida"); return; }

    const payload = {
      nombre: form.nombre.trim(),
      numPoliza: Number(form.numPoliza),
      trad: form.trad.trim(),
      rfc: form.rfc.trim(),
      fechaNacimiento: new Date(form.fechaNacimiento),
      fechaIngreso: new Date(form.fechaIngreso),
      cantidadPago: Number(form.cantidadPago),
      plan: Number(form.plan),
      frecuenciaPago: form.frecuenciaPago,
      estado: form.estado
    };

    try {
      if (isEditing) {
        await updateCliente(editId, payload);
      } else {
        await createCliente(payload);
      }
      setShowModal(false);
      setForm(initialForm);
      setIsEditing(false);
      setEditId(null);
      cargarClientes();
    } catch (error) {
      console.error("Error backend:", error.response?.data || error);
      alert(error.response?.data?.error || `Error al ${isEditing ? 'actualizar' : 'crear'} cliente`);
    }
  };

  // =============================
  // Cambiar estado
  // =============================
  const cambiarEstado = (cliente) => {
    setClienteToChange(cliente);
    setShowChangeStatusModal(true);
  };

  const confirmarCambioEstado = async () => {
    const nuevoEstado = clienteToChange.estado === 'AL_CORRIENTE' ? 'PENDIENTE' : 'AL_CORRIENTE';
    try {
      await updateCliente(clienteToChange._id, { estado: nuevoEstado });
      setShowChangeStatusModal(false);
      setClienteToChange(null);
      cargarClientes();
    } catch (error) {
      console.error("Error al cambiar estado", error);
      alert("Error al cambiar estado");
    }
  };

  // =============================
  // Manejar opciones
  // =============================
  const handleOptionChange = (value, cliente) => {
    switch (value) {
      case 'cambiar':
        cambiarEstado(cliente);
        break;
      case 'editar':
        editarCliente(cliente);
        break;
      case 'cancelar':
        cancelarCliente(cliente);
        break;
      case 'borrar':
        borrarCliente(cliente);
        break;
      default:
        break;
    }
  };
  const borrarCliente = (cliente) => {
    setClienteToDelete(cliente);
    setDeleteName("");
    setShowDeleteModal(true);
  };

  const confirmarBorrado = async () => {
    if (deleteName !== clienteToDelete.nombre) {
      alert("El nombre no coincide. Verifica y escribe el nombre exacto.");
      return;
    }
    try {
      await deleteCliente(clienteToDelete._id);
      setShowDeleteModal(false);
      setClienteToDelete(null);
      setDeleteName("");
      cargarClientes();
    } catch (error) {
      console.error("Error al borrar cliente", error);
      alert("Error al borrar cliente");
    }
  };

  // =============================
  // Cancelar cliente
  // =============================
  const cancelarCliente = (cliente) => {
    setClienteToCancel(cliente);
    setShowCancelModal(true);
  };

  const confirmarCancelacion = async () => {
    try {
      await updateCliente(clienteToCancel._id, { estado: 'CANCELADO' });
      setShowCancelModal(false);
      setClienteToCancel(null);
      cargarClientes();
    } catch (error) {
      console.error("Error al cancelar cliente", error);
      alert("Error al cancelar cliente");
    }
  };

  // =============================
  // Editar cliente
  // =============================
  const editarCliente = (cliente) => {
    setForm({
      nombre: cliente.nombre,
      numPoliza: cliente.numPoliza,
      trad: cliente.trad,
      rfc: cliente.rfc,
      fechaNacimiento: cliente.fechaNacimiento.split('T')[0], // formato date
      fechaIngreso: cliente.fechaIngreso.split('T')[0],
      cantidadPago: cliente.cantidadPago,
      plan: cliente.plan,
      frecuenciaPago: cliente.frecuenciaPago,
      estado: cliente.estado
    });
    setIsEditing(true);
    setEditId(cliente._id);
    setShowModal(true);
  };

  const clientesFiltrados = clientes.filter((c) => {
    const texto = search.toLowerCase();
    const coincideTexto =
      c.nombre.toLowerCase().includes(texto) ||
      c.trad.toLowerCase().includes(texto) ||
      c.numPoliza.toString().includes(texto);
    const coincidePlan = planFiltro === "" || Number(c.plan) === Number(planFiltro);
    const coincideFrecuencia = frecuenciaFiltro === "" || c.frecuenciaPago === frecuenciaFiltro;
    const coincideEstado = estadoFiltro === "" || c.estado === estadoFiltro;

    // Filtros extra: Mes y Día para Nacimiento
    const fechaNac = new Date(c.fechaNacimiento);
    const coincideMesNac = mesNacimientoFiltro === "" || fechaNac.getMonth() === MESES.indexOf(mesNacimientoFiltro);
    const coincideDiaNac = diaFiltro === "" || fechaNac.getDate() === Number(diaFiltro);
    const filtroNac = mesNacimientoFiltro === "" ? true : (coincideMesNac && coincideDiaNac);

    // Filtros extra: Mes y Día para Ingreso
    const fechaIng = new Date(c.fechaIngreso);
    const coincideMesIng = mesIngresoFiltro === "" || fechaIng.getMonth() === MESES.indexOf(mesIngresoFiltro);
    const coincideDiaIng = diaFiltro === "" || fechaIng.getDate() === Number(diaFiltro);
    const filtroIng = mesIngresoFiltro === "" ? true : (coincideMesIng && coincideDiaIng);

    return coincideTexto && coincidePlan && coincideFrecuencia && coincideEstado && filtroNac && filtroIng;
  }).sort((a, b) => {
    if (a.estado === 'CANCELADO' && b.estado !== 'CANCELADO') return 1;
    if (b.estado === 'CANCELADO' && a.estado !== 'CANCELADO') return -1;
    return 0;
  });

  
const exportarPDF  = () => {
  if (clientesFiltrados.length === 0) {
    alert("No hay clientes para exportar");
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Título y subtítulo (igual que antes)
  doc.setFontSize(18);
  doc.text("Lista de Clientes - DB Aseguranza", 14, 20);

  doc.setFontSize(12);
  doc.text(`Generado el: ${today.toLocaleDateString('es-MX')}`, 14, 28);

  let y = 35;
  // ... agrega aquí tus textos de filtros si los quieres (como antes)

  y += 10; // espacio extra

  const columnas = [
    "Nombre", "Póliza", "TRAD", "RFC", "F. Nacimiento", "F. Ingreso",
    "Prima", "Plan", "Frecuencia", "Próxima Fecha", "Estado"
  ];

  const datos = clientesFiltrados.map(c => {
    const nextDue = getNextDueDate(c.fechaIngreso, c.frecuenciaPago, c.estado);
    return [
      c.nombre || '',
      c.numPoliza || '',
      c.trad || '',
      c.rfc || '',
      new Date(c.fechaNacimiento).toLocaleDateString('es-MX'),
      new Date(c.fechaIngreso).toLocaleDateString('es-MX'),
      `$${c.cantidadPago || 0}`,
      PLANES[c.plan] || 'N/A',
      c.frecuenciaPago || '',
      nextDue ? nextDue.toLocaleDateString('es-MX') : 'N/A',
      c.estado?.replace("_", " ") || 'N/A'
    ];
  });

  // ¡Aquí la magia!
  autoTable(doc, {
    startY: y,
    head: [columnas],
    body: datos,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 40 },  // Nombre más ancho
      6: { cellWidth: 20 },  // Prima
    },
    margin: { top: y, left: 14, right: 14 }
  });

  // Pie de página opcional
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Página ${i} de ${pageCount} | DB Aseguranza`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`clientes_db_aseguranza_${today.toISOString().split('T')[0]}.pdf`);
};


  return (
    <div className="dashboard">
        <header className="dashboard-header">
          <div className="logo-left">
            <img src="/logoDB.png" alt="DB Aseguranza" />
            <h1>DB ASEGURANZA</h1>
          </div>

            <div className="profile">
              <span>Hola {user.username}!</span>
              <button onClick={logout}>Cerrar sesión</button>
            </div>
        </header>

      {/* =============================
          BUSCADOR
      ============================= */}
      <div class="filtros">
      <Searchbar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =============================
          FILTROS
      ============================= */}

      <div className="filtros">
        
        <br />
        <select
          value={planFiltro}
          onChange={(e) => setPlanFiltro(e.target.value)}
        >
          <option value="">Todos los planes</option>
          {Object.entries(PLANES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>

        <select
          value={frecuenciaFiltro}
          onChange={(e) => setFrecuenciaFiltro(e.target.value)}
        >
          <option value="">Todas las frecuencias</option>
          {FRECUENCIAS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="AL_CORRIENTE">Al corriente</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <select
          value={mesNacimientoFiltro}
          onChange={(e) => setMesNacimientoFiltro(e.target.value)}
        >
          <option value="">Todos los meses (nacimiento)</option>
          {MESES.map((mes, index) => (
            <option key={index} value={mes}>{mes}</option>
          ))}
        </select>

        <select
          value={mesIngresoFiltro}
          onChange={(e) => setMesIngresoFiltro(e.target.value)}
        >
          <option value="">Todos los meses (ingreso)</option>
          {MESES.map((mes, index) => (
            <option key={index} value={mes}>{mes}</option>
          ))}
        </select>

        <select
          value={diaFiltro}
          onChange={(e) => setDiaFiltro(e.target.value)}
        >
          <option value="">Cualquier día</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
            <option key={dia} value={dia}>{dia}</option>
          ))}
        </select>

      </div>
      
      {/* =============================
          TABLA DE CLIENTES
      ============================= */}
      <section className="clientes">
        {clientesFiltrados.length === 0 && <p>No hay clientes registrados</p>}

        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Póliza</th>
              <th>TRAD</th>
              <th>RFC</th>
              <th>F. Nacimiento</th>
              <th>F. Ingreso</th>
              <th>Prima</th>
              <th>Plan</th>
              <th>Frecuencia</th>
              <th>Próxima Fecha</th>
              <th>Estado</th>
              <th>...</th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.map((c) => {
              const nextDue = getNextDueDate(c.fechaIngreso, c.frecuenciaPago, c.estado);
              const sevenDaysBefore = new Date(nextDue);
              sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
              const isNearDue = today >= sevenDaysBefore && today < nextDue;
              return (
                <tr key={c._id} className={isNearDue ? 'near-due' : ''}>
                  <td>{c.nombre}</td>
                  <td>{c.numPoliza}</td>
                  <td>{c.trad}</td>
                  <td>{c.rfc}</td>
                  <td>{new Date(c.fechaNacimiento).toLocaleDateString()}</td>
                  <td>{new Date(c.fechaIngreso).toLocaleDateString()}</td>
                  <td>${c.cantidadPago}</td>
                  <td>{PLANES[c.plan]}</td>
                  <td>{c.frecuenciaPago}</td>
                  <td>{nextDue ? nextDue.toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`estado ${c.estado.toLowerCase()}`}>
                      {c.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <select onChange={(e) => { handleOptionChange(e.target.value, c); e.target.value = ''; }}>
                      <option value="">...</option>
                      <option value="cambiar">Cambiar Estado</option>
                      <option value="editar">Editar</option>
                      <option value="cancelar">Cancelar Cliente</option>
                      <option value="borrar">Borrar Cliente</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* BOTÓN FLOTANTE */}
      <button className="add-btn" onClick={() => setShowModal(true)}>+</button>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditing ? 'Editar Cliente' : 'Agregar Cliente'}</h2>

            <form onSubmit={handleSubmit}>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" required />
              <input name="numPoliza" value={form.numPoliza} onChange={handleChange} type="number" placeholder="Número de póliza" required />
              <input name="trad" value={form.trad} onChange={handleChange} placeholder="TRAD" required />
              <input name="rfc" value={form.rfc} onChange={handleChange} placeholder="RFC" required />

              <label>Fecha de nacimiento</label>
              <input name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} type="date" required />

              <label>Fecha de ingreso</label>
              <input name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} type="date" required />

              <input name="cantidadPago" value={form.cantidadPago} onChange={handleChange} type="number" placeholder="Cantidad de pago" required />

              <select name="plan" value={form.plan} onChange={handleChange} required>
                <option value="">Selecciona un plan</option>
                {Object.entries(PLANES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>

              <select name="frecuenciaPago" value={form.frecuenciaPago} onChange={handleChange} required>
                <option value="">Frecuencia de pago</option>
                {FRECUENCIAS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <select name="estado" value={form.estado} onChange={handleChange}>
                <option value="AL_CORRIENTE">Al corriente</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CANCELADO">Cancelado</option>
              </select>

              <div className="modal-actions">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CANCELACIÓN */}
      {showCancelModal && clienteToCancel && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirmar Cancelación</h2>
            <p>¿Estás seguro de cancelar al cliente <strong>{clienteToCancel.nombre}</strong>?</p>
            <p>Esta acción cambiará su estado a "Cancelado" y lo moverá al final de la lista.</p>
            <div className="modal-actions">
              <button onClick={confirmarCancelacion} style={{ backgroundColor: 'red', color: 'white' }}>Sí, Cancelar</button>
              <button onClick={() => setShowCancelModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CAMBIO ESTADO */}
      {showChangeStatusModal && clienteToChange && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirmar Cambio de Estado</h2>
            <p>¿Cambiar el estado de <strong>{clienteToChange.nombre}</strong>?</p>
            <p>De <strong>{clienteToChange.estado.replace("_", " ")}</strong> a <strong>{clienteToChange.estado === 'AL_CORRIENTE' ? 'PENDIENTE' : 'AL_CORRIENTE'}</strong></p>
            <div className="modal-actions">
              <button onClick={confirmarCambioEstado}>Sí, Cambiar</button>
              <button onClick={() => setShowChangeStatusModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN BORRADO */}
      {showDeleteModal && clienteToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirmar Borrado</h2>
            <p>¿Estás seguro de borrar al cliente <strong>{clienteToDelete.nombre}</strong>?</p>
            <p>Esta acción es irreversible. Para confirmar, escribe el nombre exacto del cliente:</p>
            <input
              type="text"
              value={deleteName}
              onChange={(e) => setDeleteName(e.target.value)}
              placeholder="Escribe el nombre aquí"
            />
            <div className="modal-actions">
              <button
                onClick={confirmarBorrado}
                disabled={deleteName !== clienteToDelete.nombre}
                style={{ backgroundColor: deleteName === clienteToDelete.nombre ? 'red' : 'gray', color: 'white' }}
              >
                Sí, Borrar
              </button>
              <button onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

<br />

      {/* Botón de exportar PDF */}
<button 
  onClick={exportarPDF}
  className="exportPDF-btn"
>
Descargar PDF (filtrados)
</button>

      <footer style={{}}>

        <p>© 2024 DB Aseguranza. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
};