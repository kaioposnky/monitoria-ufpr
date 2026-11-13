import { loadVacancies, loadVacancy } from './catalog.api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('catalog.api', () => {
  it('mapeia datas opcionais e campos nulos de vagas', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            materiaId: 2,
            professorId: 3,
            semestre: '2026/2',
            quantidadeVagas: 2,
            tipoVaga: 'REMUNERADA',
            requisitos: null,
            descricao: 'Apoio',
            status: 'ABERTA',
            dataAbertura: '2026-08-01',
            dataEncerramento: null,
          },
        ]),
        { status: 200 },
      ),
    );

    const vacancies = await loadVacancies(new AbortController().signal);
    expect(vacancies[0]).toEqual({
      id: 1,
      subjectId: 2,
      professorId: 3,
      semester: '2026/2',
      positions: 2,
      type: 'REMUNERADA',
      requirements: null,
      description: 'Apoio',
      status: 'ABERTA',
      openingDate: '2026-08-01',
      closingDate: null,
    });
  });

  it('mapeia detalhe individual da vaga e rejeita lista inválida com 502', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 4,
            materiaId: 1,
            professorId: 1,
            semestre: '2026/2',
            quantidadeVagas: 1,
            tipoVaga: 'VOLUNTARIA',
            requisitos: null,
            descricao: null,
            status: 'ENCERRADA',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    const detail = await loadVacancy('4', new AbortController().signal);
    expect(detail.openingDate).toBeNull();
    expect(detail.closingDate).toBeNull();

    await expect(
      loadVacancies(new AbortController().signal),
    ).rejects.toMatchObject({ status: 502 });
  });
});
