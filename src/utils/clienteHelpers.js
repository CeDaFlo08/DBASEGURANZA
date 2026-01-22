// src/utils/clienteHelpers.js
import { MESES } from "../components/elements/controls/ListasClient";

export const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== date.getDate()) d.setDate(0);
  return d;
};

export const getNextDueDate = (fechaIngreso, frecuencia, status) => {
  const today = new Date();
  const start = new Date(fechaIngreso);
  let current = new Date(start);
  let lastDue = new Date(start);

  while (current <= today) {
    lastDue = new Date(current);
    switch (frecuencia) {
      case 'MENSUAL': current = addMonths(current, 1); break;
      case 'TRIMESTRAL': current = addMonths(current, 3); break;
      case 'SEMESTRAL': current = addMonths(current, 6); break;
      case 'ANUAL': current.setFullYear(current.getFullYear() + 1); break;
      default: return null;
    }
  }
  return status === 'PENDIENTE' ? lastDue : current;
};

export const obtenerEstructuraPagos = (cliente) => {
  const inicio = new Date(cliente.fechaIngreso);
  const hoy = new Date();
  const pagosRealizados = cliente.pagos || [];
  const saltos = { 'MENSUAL': 1, 'TRIMESTRAL': 3, 'SEMESTRAL': 6, 'ANUAL': 12 };
  const mesesASaltar = saltos[cliente.frecuenciaPago] || 1;

  let estructura = {};
  let iterador = new Date(inicio);
  const limiteCorte = new Date(hoy.getFullYear() + 1, 11, 31);

  while (iterador <= limiteCorte && iterador.getFullYear() <= hoy.getFullYear()) {
    const anio = iterador.getFullYear();
    const mes = iterador.getMonth();
    if (!estructura[anio]) estructura[anio] = [];

    const pagado = pagosRealizados.find(p => p.mes === mes && p.anio === anio);
    let estadoLabel = pagado ? 'PAGADO' : (iterador < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) ? 'PENDIENTE' : 'PRÓXIMO');

    estructura[anio].push({ mes, nombreMes: MESES[mes], status: estadoLabel });
    iterador.setMonth(iterador.getMonth() + mesesASaltar);
  }
  return estructura;
};