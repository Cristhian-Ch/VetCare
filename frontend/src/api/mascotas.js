import { apiClient } from './client';

export const getMascotas = (especie = '') =>
  apiClient(`/mascotas${especie ? `?especie=${encodeURIComponent(especie)}` : ''}`);

export const crearMascota = (data) =>
  apiClient('/mascotas', { method: 'POST', body: JSON.stringify(data) });

export const actualizarMascota = (id, data) =>
  apiClient(`/mascotas/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const eliminarMascota = (id) =>
  apiClient(`/mascotas/${id}`, { method: 'DELETE' });
