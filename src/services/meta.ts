import { apiRequest } from '../utils/apiClient'

export type FacultyProgram = {
  faculty: string
  programs: string[]
}

export const fetchFacultiesPrograms = () => {
  return apiRequest<{ faculties: FacultyProgram[] }>('/meta/faculties-programs')
}
