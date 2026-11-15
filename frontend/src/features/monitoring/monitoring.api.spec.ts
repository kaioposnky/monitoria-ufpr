import { setAuthToken } from '../../shared/api/http';
import {
  createApplication,
  createOfficeHours,
  createVacancy,
  loadAgendaEvents,
  reviewApplicationStatus,
} from './monitoring.api';

afterEach(() => {
  setAuthToken(null);
  vi.restoreAllMocks();
});

describe('monitoring.api', () => {
  it('envia e mapeia datas opcionais na criação de vaga', async () => {
    setAuthToken('jwt-prof');
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 12,
          disciplinaId: 1,
          professorId: 2,
          semestre: '2026/2',
          quantidadeVagas: 2,
          tipoVaga: 'REMUNERADA',
          requisitos: 'Nota >= 75',
          descricao: 'Plantões semanais',
          status: 'ABERTA',
          dataAbertura: '2026-08-01',
          dataEncerramento: '2026-08-20',
        }),
        { status: 201 },
      ),
    );

    const vacancy = await createVacancy({
      disciplinaId: 1,
      professorId: 2,
      semestre: '2026/2',
      quantidadeVagas: 2,
      tipoVaga: 'REMUNERADA',
      requisitos: 'Nota >= 75',
      descricao: 'Plantões semanais',
      dataAbertura: '2026-08-01',
      dataEncerramento: '2026-08-20',
    });

    expect(vacancy.openingDate).toBe('2026-08-01');
    expect(vacancy.closingDate).toBe('2026-08-20');
    expect(spy.mock.calls[0]?.[0]).toBe('/api/v1/vagas-monitoria');
  });

  it('mapeia eventos sincronizados da agenda externa', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            idExterno: 'VAGA_ABERTURA:12',
            tipo: 'ABERTURA_VAGA',
            referenciaId: 12,
            titulo: 'Abertura de inscrições - CI1055',
            descricao: 'Semestre 2026/2',
            data: '2026-08-01',
            diaSemana: null,
            horaInicio: null,
            horaFim: null,
            localOuLink: null,
          },
          {
            idExterno: 'HORARIO:3',
            tipo: 'HORARIO_MONITORIA',
            referenciaId: 3,
            titulo: 'Monitoria CI1055 - Lucas',
            descricao: 'Atendimento semanal',
            data: null,
            diaSemana: 'TERCA',
            horaInicio: '14:00:00',
            horaFim: '16:00:00',
            localOuLink: 'Lab 2 - DInf',
          },
        ]),
        { status: 200 },
      ),
    );

    const events = await loadAgendaEvents(new AbortController().signal);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      externalId: 'VAGA_ABERTURA:12',
      type: 'ABERTURA_VAGA',
      date: '2026-08-01',
    });
    expect(events[1]).toMatchObject({
      externalId: 'HORARIO:3',
      type: 'HORARIO_MONITORIA',
      weekday: 'TERCA',
      locationOrLink: 'Lab 2 - DInf',
    });
  });

  it('mapeia candidatura, revisão e cadastro de horário e propaga conflito 409', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 21,
            vagaId: 12,
            alunoId: 5,
            notaDisciplina: 91,
            cr: 84.5,
            justificativa: 'Interesse',
            status: 'PENDENTE',
            criadoEm: '2026-08-02T12:00:00Z',
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 21,
            vagaId: 12,
            alunoId: 5,
            notaDisciplina: 91,
            cr: 84.5,
            justificativa: 'Interesse',
            status: 'APROVADO',
            criadoEm: '2026-08-02T12:00:00Z',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 8,
            monitorId: 1,
            diaSemana: 'QUARTA',
            horaInicio: '10:00',
            horaFim: '12:00',
            localAtendimento: 'Lab 3',
            linkReuniao: null,
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 409,
            mensagem: 'Candidaturas só são aceitas para vagas com status ABERTA.',
          }),
          { status: 409 },
        ),
      );

    const app = await createApplication({
      vagaId: 12,
      alunoId: 5,
      notaDisciplina: 91,
      cr: 84.5,
      justificativa: 'Interesse',
    });
    expect(app.status).toBe('PENDENTE');

    const reviewed = await reviewApplicationStatus(21, 'APROVADO');
    expect(reviewed.status).toBe('APROVADO');

    const officeHours = await createOfficeHours({
      monitorId: 1,
      diaSemana: 'QUARTA',
      horaInicio: '10:00',
      horaFim: '12:00',
      localAtendimento: 'Lab 3',
      linkReuniao: null,
    });
    expect(officeHours.weekday).toBe('QUARTA');

    await expect(
      createApplication({
        vagaId: 99,
        alunoId: 5,
        notaDisciplina: null,
        cr: null,
        justificativa: null,
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: 'Candidaturas só são aceitas para vagas com status ABERTA.',
    });
  });
});
