import {
  displayOptional,
  formatDateBr,
  formatSubjectLabel,
  formatTimeShort,
  formatVacancyLabel,
  isEndAfterStart,
  isHttpUrl,
  isNonNegativeInteger,
  isPositiveInteger,
  isScoreInRange,
  isSemester,
  isValidDateRange,
  isValidTime,
} from './monitoring.rules';

describe('monitoring.rules', () => {
  it('valida inteiros positivos e não negativos', () => {
    expect(isPositiveInteger(' 42 ')).toBe(true);
    expect(isPositiveInteger('0')).toBe(false);
    expect(isPositiveInteger('-3')).toBe(false);
    expect(isPositiveInteger('3.5')).toBe(false);

    expect(isNonNegativeInteger('0')).toBe(true);
    expect(isNonNegativeInteger('15')).toBe(true);
    expect(isNonNegativeInteger('-1')).toBe(false);
  });

  it('valida notas e CR entre 0 e 100 com até duas casas decimais', () => {
    expect(isScoreInRange('0')).toBe(true);
    expect(isScoreInRange('100')).toBe(true);
    expect(isScoreInRange('87.55')).toBe(true);
    expect(isScoreInRange('100.01')).toBe(false);
    expect(isScoreInRange('87.555')).toBe(false);
    expect(isScoreInRange('87,5')).toBe(false);
    expect(isScoreInRange('1e2')).toBe(false);
  });

  it('valida formato de semestre AAAA/1 ou AAAA/2', () => {
    expect(isSemester('2026/1')).toBe(true);
    expect(isSemester(' 2026/2 ')).toBe(true);
    expect(isSemester('2026/3')).toBe(false);
    expect(isSemester('26/2')).toBe(false);
    expect(isSemester('2026-2')).toBe(false);
  });

  it('valida horários e garante hora final posterior à inicial', () => {
    expect(isValidTime('08:30')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isEndAfterStart('14:00', '16:00')).toBe(true);
    expect(isEndAfterStart('14:00', '14:00')).toBe(false);
    expect(isEndAfterStart('16:00', '14:00')).toBe(false);
  });

  it('valida intervalo opcional de datas e formata em pt-BR', () => {
    expect(isValidDateRange('', '')).toBe(true);
    expect(isValidDateRange('2026-08-01', '')).toBe(true);
    expect(isValidDateRange('2026-08-01', '2026-08-01')).toBe(true);
    expect(isValidDateRange('2026-08-01', '2026-08-20')).toBe(true);
    expect(isValidDateRange('2026-08-20', '2026-08-01')).toBe(false);

    expect(formatDateBr('2026-08-05')).toBe('05/08/2026');
    expect(formatDateBr(null)).toBe('Não informada');
  });

  it('valida URLs HTTP/HTTPS e formata rótulos', () => {
    expect(isHttpUrl('https://teams.microsoft.com/l/meetup')).toBe(true);
    expect(isHttpUrl('http://localhost:5173')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('ftp://ufpr.br')).toBe(false);

    expect(formatTimeShort('14:00:00')).toBe('14:00');
    expect(displayOptional('   ', 'Sem observação')).toBe('Sem observação');

    const subject = {
      id: 1,
      code: 'CI1055',
      name: 'AED 1',
      department: 'DInf',
    };
    expect(formatSubjectLabel(subject)).toBe('CI1055 — AED 1');
    expect(
      formatVacancyLabel(
        {
          id: 9,
          subjectId: 1,
          professorId: 2,
          semester: '2026/2',
          positions: 2,
          type: 'REMUNERADA',
          requirements: null,
          description: null,
          status: 'ABERTA',
          openingDate: null,
          closingDate: null,
        },
        subject,
      ),
    ).toBe('CI1055 — AED 1 · 2026/2 · Remunerada · 2 vaga(s)');
  });
});
