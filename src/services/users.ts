import api, { handleApiError } from './api';

export interface UserPermissions {
  isAdmin: boolean;
  isEditor: boolean;
  isTherapist: boolean;
  isDirector: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  permissions: UserPermissions;
  // Campos legacy para compatibilidad
  role?: 'admin' | 'editor' | 'viewer';
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
  permissions: UserPermissions;
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
  userData: {
    name?: string;
    email?: string;
    password?: string;
    permissions?: UserPermissions;
  }
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

// Helper para obtener el label de permisos
export const getPermissionsLabel = (permissions: UserPermissions): string => {
  const labels: string[] = [];
  if (permissions.isAdmin) labels.push('Admin');
  if (permissions.isEditor) labels.push('Editor');
  if (permissions.isTherapist) labels.push('Terapeuta');
  if (permissions.isDirector) labels.push('Director');
  return labels.join(' + ') || 'Sin permisos';
};

// Helper para obtener el label del rol (legacy)
export const getRoleLabel = (role: string): string => {
  const roles: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Visualizador',
    therapist: 'Terapeuta'
  };
  return roles[role] || role;
};

// Helper para obtener el color del rol (legacy)
export const getRoleColor = (role: string): 'error' | 'warning' | 'info' | 'default' => {
  const colors: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    admin: 'error',
    editor: 'warning',
    viewer: 'info',
    therapist: 'info'
  };
  return colors[role] || 'default';
};

// Obtener todos los terapeutas (sin paginación)
export const getTherapists = async (): Promise<User[]> => {
  try {
    const response = await getUsers(1, 1000); // Obtener hasta 1000 usuarios
    // Filtrar solo terapeutas
    return response.data.filter(user => user.permissions.isTherapist);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
