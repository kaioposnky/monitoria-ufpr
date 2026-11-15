import {
  loadRelations,
  loadSubjects,
  loadTopics,
  loadTopicsByDiscipline,
  loadVacancies,
  loadVacancy,
} from './catalog.api';

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
            disciplinaId: 2,
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
            disciplinaId: 1,
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
    expect(detail.subjectId).toBe(1);
    expect(detail.openingDate).toBeNull();
    expect(detail.closingDate).toBeNull();

    await expect(
      loadVacancies(new AbortController().signal),
    ).rejects.toMatchObject({ status: 502 });
  });

  it('carrega disciplinas (/disciplinas), matérias 1:N (/materias) e vínculos (/cursos-disciplinas)', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 1,
              codigo: 'CI1055',
              nome: 'Algoritmos 1',
              departamento: 'DInf',
            },
          ]),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 10,
              disciplinaId: 1,
              nome: 'Ponteiros',
              descricao: 'Alocação dinâmica',
            },
          ]),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 10,
              disciplinaId: 1,
              nome: 'Ponteiros',
              descricao: 'Alocação dinâmica',
            },
          ]),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ cursoId: 1, disciplinaId: 1 }]), {
          status: 200,
        }),
      );

    const subjects = await loadSubjects();
    expect(subjects).toEqual([
      { id: 1, code: 'CI1055', name: 'Algoritmos 1', department: 'DInf' },
    ]);

    const topics = await loadTopics();
    expect(topics).toEqual([
      {
        id: 10,
        disciplineId: 1,
        name: 'Ponteiros',
        description: 'Alocação dinâmica',
      },
    ]);

    const byDisc = await loadTopicsByDiscipline(1);
    expect(byDisc).toHaveLength(1);

    const links = await loadRelations();
    expect(links).toEqual([{ courseId: 1, subjectId: 1 }]);

    expect(spy.mock.calls[0]?.[0]).toBe('/api/v1/disciplinas');
    expect(spy.mock.calls[1]?.[0]).toBe('/api/v1/materias');
    expect(spy.mock.calls[2]?.[0]).toBe('/api/v1/materias/disciplina/1');
    expect(spy.mock.calls[3]?.[0]).toBe('/api/v1/cursos-disciplinas');
  });
});
