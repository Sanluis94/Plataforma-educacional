import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StudentLmsModules } from '../modules/ux/components/StudentLmsModules';
vi.mock('../modules/core/services/firebaseConfig', () => ({ db: null }));
vi.mock('../modules/data/repositories/gradebookRepository', async importOriginal => ({
  ...await importOriginal<object>(),
  getStudentAttendanceRecords: vi.fn(async () => [{ id: 'published', turmaId: 'class-a', data: '2026-10-13', criadoEm: '2026-10-13T12:00:00Z', registros: [{ studentId: 'student-a', studentName: '', status: 'presente' }] }]),
  subscribeForumTopicsByClass: () => () => {},
}));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ getSubmissionsByStudentInClass: vi.fn(async () => []), getPublishedSubmissionReviewsByStudent: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/examRepository', () => ({ getExamAttemptsByStudent: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ getActivitiesByClass: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/gradePolicyRepository', async importOriginal => ({ ...await importOriginal<object>(), getGradePolicy: vi.fn(async () => null) }));
vi.mock('../modules/core/services/certificateService', () => ({ getStudentCertificates: vi.fn(async () => []) }));
afterEach(cleanup);
it('taxa calculada informa permanentemente sua cobertura, mesmo quando há registros publicados', async () => {
  render(<StudentLmsModules studentId="student-a" studentName="Aluna fictícia" selectedClassId="class-a" activeView="gradebook" onViewChange={vi.fn()} />);
  expect(await screen.findByText('100%')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Frequência dos registros publicados' })).toBeInTheDocument();
  expect(screen.getByText(/Chamadas anteriores podem ainda aguardar publicação individual/)).toBeInTheDocument();
  expect(screen.getByText(/antes de usar esta taxa como frequência total/)).toBeInTheDocument();
});
