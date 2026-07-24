import { apiClient } from './client';

export const getUsuarios = () =>
  apiClient('/usuarios', { method: 'GET' });

export const actualizarUsuario = (id, datos) =>
  apiClient(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });

export const crearUsuarioAdmin = (datos) =>
  apiClient('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

export const eliminarUsuario = (id) =>
  apiClient(`/usuarios/${id}`, { method: 'DELETE' });
