import { apiClient } from './client';

export const getCitas = async () => {
  return apiClient('/citas', { method: 'GET' });
};

export const crearCita = async (citaData) => {
  return apiClient('/citas', {
    method: 'POST',
    body: JSON.stringify(citaData),
  });
};

export const cancelarCita = async (id, motivo) => {
  return apiClient(`/citas/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ motivo })
  });
};
