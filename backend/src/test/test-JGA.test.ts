// test-JGA.test.ts
import { addCandidate } from '../application/services/candidateService';
import * as validator from '../application/validator';
import { Candidate } from '../domain/models/Candidate';

// Mock de los modelos para evitar interacción real con la base de datos
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

describe('Funcionalidad: Añadir candidato', () => {
  describe('Escenario: Los datos del candidato no son válidos', () => {
    it('Dado que los datos del candidato son inválidos, cuando intento añadir el candidato, entonces se lanza un error de validación', async () => {
      // Given
      const datosInvalidos = { nombre: '' }; // Simulación de datos inválidos
      jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {
        throw new Error('Datos inválidos');
      });

      // When & Then
      await expect(addCandidate(datosInvalidos)).rejects.toThrow(
        'Datos inválidos',
      );
    });
  });

  describe('Escenario: Los datos del candidato son válidos', () => {
    it('Dado que los datos del candidato son válidos, cuando intento añadir el candidato, entonces el candidato se guarda correctamente y se devuelve el candidato guardado', async () => {
      // Given
      const datosValidos = { nombre: 'Juan', email: 'juan@email.com' };
      jest
        .spyOn(validator, 'validateCandidateData')
        .mockImplementation(() => true);

      const mockSave = jest.fn().mockResolvedValue({ id: 1, ...datosValidos });
      (Candidate as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSave;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
      });

      // When
      const resultado = await addCandidate(datosValidos);

      // Then
      expect(mockSave).toHaveBeenCalled();
      expect(resultado).toEqual(
        expect.objectContaining({
          id: 1,
          nombre: 'Juan',
          email: 'juan@email.com',
        }),
      );
    });
  });

  describe('Escenario: El candidato tiene datos de educación', () => {
    it('Dado que el candidato tiene datos de educación, cuando intento añadir el candidato, entonces se guardan las instancias de educación asociadas', async () => {
      // Given
      const datosValidos = {
        nombre: 'Ana',
        email: 'ana@email.com',
        educations: [
          { titulo: 'Grado', institucion: 'Uni', anio: 2020 },
          { titulo: 'Máster', institucion: 'Uni2', anio: 2022 },
        ],
      };
      jest
        .spyOn(validator, 'validateCandidateData')
        .mockImplementation(() => true);
      const mockSaveCandidate = jest
        .fn()
        .mockResolvedValue({ id: 2, ...datosValidos });
      (Candidate as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSaveCandidate;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
      });
      const { Education } = require('../domain/models/Education');
      const mockSaveEducation = jest.fn().mockResolvedValue({});
      (Education as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSaveEducation;
      });

      // When
      await addCandidate(datosValidos);

      // Then
      expect(mockSaveCandidate).toHaveBeenCalled();
      expect(mockSaveEducation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Escenario: El candidato tiene experiencia laboral', () => {
    it('Dado que el candidato tiene experiencia laboral, cuando intento añadir el candidato, entonces se guardan las instancias de experiencia asociadas', async () => {
      // Given
      const datosValidos = {
        nombre: 'Luis',
        email: 'luis@email.com',
        workExperiences: [{ puesto: 'Dev', empresa: 'Empresa1', anio: 2021 }],
      };
      jest
        .spyOn(validator, 'validateCandidateData')
        .mockImplementation(() => true);
      const mockSaveCandidate = jest
        .fn()
        .mockResolvedValue({ id: 3, ...datosValidos });
      (Candidate as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSaveCandidate;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
      });
      const { WorkExperience } = require('../domain/models/WorkExperience');
      const mockSaveWork = jest.fn().mockResolvedValue({});
      (WorkExperience as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSaveWork;
      });

      // When
      await addCandidate(datosValidos);

      // Then
      expect(mockSaveCandidate).toHaveBeenCalled();
      expect(mockSaveWork).toHaveBeenCalledTimes(1);
    });
  });

  describe('Escenario: El candidato tiene CV', () => {
    it('Dado que el candidato tiene un CV, cuando intento añadir el candidato, entonces se guarda la instancia de CV asociada', async () => {
      // Given
      const datosValidos = {
        nombre: 'Marta',
        email: 'marta@email.com',
        cv: { url: 'cv.pdf', tipo: 'pdf' },
      };
      jest
        .spyOn(validator, 'validateCandidateData')
        .mockImplementation(() => true);
      const mockSaveCandidate = jest
        .fn()
        .mockResolvedValue({ id: 4, ...datosValidos });
      (Candidate as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSaveCandidate;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
      });
      const { Resume } = require('../domain/models/Resume');
      const mockSaveResume = jest.fn().mockResolvedValue({});
      (Resume as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSaveResume;
      });

      // When
      await addCandidate(datosValidos);

      // Then
      expect(mockSaveCandidate).toHaveBeenCalled();
      expect(mockSaveResume).toHaveBeenCalledTimes(1);
    });
  });

  describe('Escenario: El email ya existe en la base de datos', () => {
    it('Dado que el email ya existe, cuando intento añadir el candidato, entonces se lanza un error específico de email duplicado', async () => {
      // Given
      const datosValidos = { nombre: 'Pedro', email: 'pedro@email.com' };
      jest
        .spyOn(validator, 'validateCandidateData')
        .mockImplementation(() => true);
      const mockSave = jest.fn().mockRejectedValue({ code: 'P2002' });
      (Candidate as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSave;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
      });

      // When & Then
      await expect(addCandidate(datosValidos)).rejects.toThrow(
        'The email already exists in the database',
      );
    });
  });

  describe('Escenario: Error inesperado al guardar el candidato', () => {
    it('Dado que ocurre un error inesperado al guardar, cuando intento añadir el candidato, entonces se lanza el error original', async () => {
      // Given
      const datosValidos = { nombre: 'Sara', email: 'sara@email.com' };
      jest
        .spyOn(validator, 'validateCandidateData')
        .mockImplementation(() => true);
      const mockSave = jest
        .fn()
        .mockRejectedValue(new Error('Error inesperado'));
      (Candidate as unknown as jest.Mock).mockImplementation(function (
        this: any,
        data: any,
      ) {
        Object.assign(this, data);
        this.save = mockSave;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
      });

      // When & Then
      await expect(addCandidate(datosValidos)).rejects.toThrow(
        'Error inesperado',
      );
    });
  });
});
