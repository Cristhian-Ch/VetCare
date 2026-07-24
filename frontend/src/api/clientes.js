import { apiClient } from './client';

export const getClientes = (q = '') =>
  apiClient(`/clientes${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const crearCliente = (data) =>
  apiClient('/clientes', { method: 'POST', body: JSON.stringify(data) });

export const actualizarCliente = (id, data) =>
  apiClient(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const eliminarCliente = (id) =>
  apiClient(`/clientes/${id}`, { method: 'DELETE' });
