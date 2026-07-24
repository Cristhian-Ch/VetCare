const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Manejo de errores basado en RFC 7807 como se definió en el SAD
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || errorData.message || 'Error en la petición HTTP');
  }

  // Devolver JSON si hay contenido, de lo contrario vacío
  if (response.status === 204) return null;
  return response.json();
};
