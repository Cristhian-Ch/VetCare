import { apiClient } from './client';

export const registrarPago = async (pagoData) => {
  return apiClient('/pagos', {
    method: 'POST',
    body: JSON.stringify(pagoData),
  });
};

export const getPagos = async () => {
  return apiClient('/pagos', { method: 'GET' });
};
