import { useClientes } from "../hooks/useClientes";
import { getNextDueDate } from "../utils/clienteHelpers";
// ... imports de componentes pequeños

export const Dashboard = () => {
  const { clientes, eliminarCliente, actualizarPagoMasivo } = useClientes();
  const [search, setSearch] = useState("");
  // ... solo estados de UI (cuál modal está abierto)

  return (
    <div className="dashboard">
      <Header />
      <Filters search={search} setSearch={setSearch} />
      
      <table className="clientes-table">
        {/* Usas componentes pequeños para las filas */}
        {clientes.map(c => (
          <ClienteRow key={c._id} cliente={c} />
        ))}
      </table>

      {/* Los modales son ahora etiquetas simples */}
      {showDetailsModal && (
        <DetailsModal 
          cliente={clienteSelected} 
          onClose={() => setShowDetailsModal(false)}
          onUpdate={actualizarPagoMasivo}
        />
      )}
    </div>
  );
};