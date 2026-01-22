export const cargarClientes = async () => {
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
