import api, { handleApiError } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  isDirector?: boolean;
  uid?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

// Obtener todos los usuarios
export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  role: string = ''
): Promise<UsersResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role })
    });

    const response = await api.get(`/users?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener un usuario por ID
export const getUser = async (id: string): Promise<UserResponse> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear un nuevo usuario
export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<UserResponse> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar un usuario
export const updateUser = async (
  id: string,
  userData: Partial<User> & { password?: string }
): Promise<UserResponse> => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar un usuario
export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Helper para obtener el label del rol
export const getRoleLabel = (role: string): string => {
  const roles: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Visualizador'
  };
  return roles[role] || role;
};

// Helper para obtener el color del rol
export const getRoleColor = (role: string): 'error' | 'warning' | 'info' | 'default' => {
  const colors: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    admin: 'error',
    editor: 'warning',
    viewer: 'info'
  };
  return colors[role] || 'default';
};
