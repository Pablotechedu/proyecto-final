import api, { handleApiError } from './api';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  patientID?: string;
  patientCode?: string;
  birthDate?: any;
  age?: number;
  gender?: string;
  email?: string;
  studentEmail?: string;
  phone?: string;
  address?: string;
  diagnosis?: string;
  medication?: string;
  status?: string;
  notes?: string;
  school?: string;
  grade?: string;
  startDate?: any;
  assignedTherapist?: string;
  hourlyRate?: number;
  monthlyFee?: number;
  paymentFrequency?: string;
  googleMeetEmail?: string;
  lastProgressReport?: any;
  lastEvaluation?: any;
  createdAt?: any;
  updatedAt?: any;
  parentTutors?: ParentTutor[];
  relatedProfessionals?: RelatedProfessional[];
}

export interface ParentTutor {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export interface RelatedProfessional {
  id: string;
  name: string;
  profession: string;
  specialty: string;
  institution: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface PatientsResponse {
  success: boolean;
  data: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface PatientResponse {
  success: boolean;
  data: Patient;
}

// Obtener todos los pacientes con paginación
export const getPatients = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = ''
): Promise<PatientsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status })
    });

    const response = await api.get(`/patients?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener un paciente por ID
export const getPatient = async (id: string): Promise<PatientResponse> => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear un nuevo paciente
export const createPatient = async (patientData: Partial<Patient>): Promise<PatientResponse> => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar un paciente
export const updatePatient = async (id: string, patientData: Partial<Patient>): Promise<PatientResponse> => {
  try {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar un paciente
export const deletePatient = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar pacientes
export const searchPatients = async (searchTerm: string): Promise<PatientsResponse> => {
  return getPatients(1, 50, searchTerm);
};

// Helper functions
export const calculateAge = (birthDate: any): number => {
  if (!birthDate) return 0;
  const birth = birthDate.toDate ? birthDate.toDate() : new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getFullName = (patient: Patient): string => {
  // Intentar diferentes combinaciones de campos
  if (patient.name) return patient.name;
  if (patient.firstName && patient.lastName) return `${patient.firstName} ${patient.lastName}`;
  if (patient.firstName) return patient.firstName;
  if (patient.lastName) return patient.lastName;
  return 'Sin nombre';
};

// Función para obtener todos los pacientes (sin paginación) - para compatibilidad
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const response = await getPatients(1, 1000); // Obtener hasta 1000 pacientes
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener padres/tutores de un paciente
export const getPatientParents = async (patientId: string): Promise<ParentTutor[]> => {
  try {
    const response = await getPatient(patientId);
    return response.data.parentTutors || [];
  } catch (error) {
    console.error('Error getting patient parents:', error);
    return [];
  }
};

// Obtener un padre/tutor específico por ID
export const getParentTutorById = async (patientId: string, parentId: string): Promise<ParentTutor | null> => {
  try {
    const parents = await getPatientParents(patientId);
    return parents.find(p => p.id === parentId) || null;
  } catch (error) {
    console.error('Error getting parent tutor by id:', error);
    return null;
  }
};

// Obtener un profesional relacionado específico por ID
export const getRelatedProfessionalById = async (patientId: string, professionalId: string): Promise<RelatedProfessional | null> => {
  try {
    const professionals = await getRelatedProfessionals(patientId);
    return professionals.find(p => p.id === professionalId) || null;
  } catch (error) {
    console.error('Error getting related professional by id:', error);
    return null;
  }
};

// Obtener profesionales relacionados de un paciente
export const getRelatedProfessionals = async (patientId: string): Promise<RelatedProfessional[]> => {
  try {
    const response = await getPatient(patientId);
    return response.data.relatedProfessionals || [];
  } catch (error) {
    console.error('Error getting related professionals:', error);
    return [];
  }
};

// Agregar padre/tutor a un paciente
export const addParentTutor = async (patientId: string, parentData: Partial<ParentTutor>): Promise<ParentTutor> => {
  try {
    const response = await api.post(`/patients/${patientId}/parents`, parentData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar padre/tutor
export const updateParentTutor = async (patientId: string, parentId: string, parentData: Partial<ParentTutor>): Promise<ParentTutor> => {
  try {
    const response = await api.put(`/patients/${patientId}/parents/${parentId}`, parentData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar padre/tutor
export const deleteParentTutor = async (patientId: string, parentId: string): Promise<void> => {
  try {
    await api.delete(`/patients/${patientId}/parents/${parentId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Agregar profesional relacionado
export const addRelatedProfessional = async (patientId: string, professionalData: Partial<RelatedProfessional>): Promise<RelatedProfessional> => {
  try {
    const response = await api.post(`/patients/${patientId}/professionals`, professionalData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar profesional relacionado
export const updateRelatedProfessional = async (patientId: string, professionalId: string, professionalData: Partial<RelatedProfessional>): Promise<RelatedProfessional> => {
  try {
    const response = await api.put(`/patients/${patientId}/professionals/${professionalId}`, professionalData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar profesional relacionado
export const deleteRelatedProfessional = async (patientId: string, professionalId: string): Promise<void> => {
  try {
    await api.delete(`/patients/${patientId}/professionals/${professionalId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Alias para compatibilidad con código existente
export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await getPatient(id);
  return response.data;
};
