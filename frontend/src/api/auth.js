import { apiClient } from './client';

export const login = async (correo, password) => {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
};

export const register = async (nombre, correo, password, rol = 'cliente') => {
  return apiClient('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre, correo, password, rol }),
  });
};
