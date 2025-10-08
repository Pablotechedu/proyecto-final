import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
  birthDate: string;
  school: string;
  grade: string;
  startDate: string;
  status: 'active' | 'inactive';
  diagnosis: string;
  therapistEmail?: string;
}

export interface ParentTutor {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  isPrimary: boolean;
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

// Obtener todos los pacientes
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, orderBy('lastName'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Patient));
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Obtener paciente por ID
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const snapshot = await getDoc(patientRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Patient;
    }
    return null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};

// Obtener pacientes activos
export const getActivePatients = async (): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef, 
      where('status', '==', 'active'),
      orderBy('lastName')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Patient));
  } catch (error) {
    console.error('Error fetching active patients:', error);
    throw error;
  }
};

// Buscar pacientes por nombre o código
export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    const searchLower = searchTerm.toLowerCase();
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient))
      .filter(patient => 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.patientCode.toLowerCase().includes(searchLower)
      );
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

// Obtener tutores/padres de un paciente
export const getPatientParents = async (patientId: string): Promise<ParentTutor[]> => {
  try {
    const parentsRef = collection(db, 'patients', patientId, 'parentTutors');
    const snapshot = await getDocs(parentsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ParentTutor));
  } catch (error) {
    console.error('Error fetching patient parents:', error);
    throw error;
  }
};

// Calcular edad del paciente
export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Formatear nombre completo
export const getFullName = (patient: Patient): string => {
  return `${patient.firstName} ${patient.lastName}`;
};

// CRUD de Padres/Tutores

// Agregar padre/tutor
export const addParentTutor = async (patientId: string, parentData: Omit<ParentTutor, 'id'>): Promise<string> => {
  try {
    const parentsRef = collection(db, 'patients', patientId, 'parentTutors');
    const docRef = await addDoc(parentsRef, parentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding parent/tutor:', error);
    throw error;
  }
};

// Actualizar padre/tutor
export const updateParentTutor = async (
  patientId: string, 
  parentId: string, 
  parentData: Partial<ParentTutor>
): Promise<void> => {
  try {
    const parentRef = doc(db, 'patients', patientId, 'parentTutors', parentId);
    await updateDoc(parentRef, parentData);
  } catch (error) {
    console.error('Error updating parent/tutor:', error);
    throw error;
  }
};

// Eliminar padre/tutor
export const deleteParentTutor = async (patientId: string, parentId: string): Promise<void> => {
  try {
    const parentRef = doc(db, 'patients', patientId, 'parentTutors', parentId);
    await deleteDoc(parentRef);
  } catch (error) {
    console.error('Error deleting parent/tutor:', error);
    throw error;
  }
};

// Obtener padre/tutor por ID
export const getParentTutorById = async (patientId: string, parentId: string): Promise<ParentTutor | null> => {
  try {
    const parentRef = doc(db, 'patients', patientId, 'parentTutors', parentId);
    const snapshot = await getDoc(parentRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as ParentTutor;
    }
    return null;
  } catch (error) {
    console.error('Error fetching parent/tutor:', error);
    throw error;
  }
};

// CRUD de Profesionales Relacionados

// Obtener profesionales relacionados de un paciente
export const getRelatedProfessionals = async (patientId: string): Promise<RelatedProfessional[]> => {
  try {
    const professionalsRef = collection(db, 'patients', patientId, 'relatedProfessionals');
    const snapshot = await getDocs(professionalsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RelatedProfessional));
  } catch (error) {
    console.error('Error fetching related professionals:', error);
    throw error;
  }
};

// Agregar profesional relacionado
export const addRelatedProfessional = async (
  patientId: string, 
  professionalData: Omit<RelatedProfessional, 'id'>
): Promise<string> => {
  try {
    const professionalsRef = collection(db, 'patients', patientId, 'relatedProfessionals');
    const docRef = await addDoc(professionalsRef, professionalData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding related professional:', error);
    throw error;
  }
};

// Actualizar profesional relacionado
export const updateRelatedProfessional = async (
  patientId: string,
  professionalId: string,
  professionalData: Partial<RelatedProfessional>
): Promise<void> => {
  try {
    const professionalRef = doc(db, 'patients', patientId, 'relatedProfessionals', professionalId);
    await updateDoc(professionalRef, professionalData);
  } catch (error) {
    console.error('Error updating related professional:', error);
    throw error;
  }
};

// Eliminar profesional relacionado
export const deleteRelatedProfessional = async (patientId: string, professionalId: string): Promise<void> => {
  try {
    const professionalRef = doc(db, 'patients', patientId, 'relatedProfessionals', professionalId);
    await deleteDoc(professionalRef);
  } catch (error) {
    console.error('Error deleting related professional:', error);
    throw error;
  }
};

// Obtener profesional relacionado por ID
export const getRelatedProfessionalById = async (
  patientId: string,
  professionalId: string
): Promise<RelatedProfessional | null> => {
  try {
    const professionalRef = doc(db, 'patients', patientId, 'relatedProfessionals', professionalId);
    const snapshot = await getDoc(professionalRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as RelatedProfessional;
    }
    return null;
  } catch (error) {
    console.error('Error fetching related professional:', error);
    throw error;
  }
};
