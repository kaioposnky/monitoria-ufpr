package com.sistema.integration.agenda;

import com.sistema.entity.HorarioAtendimento;
import com.sistema.entity.VagaMonitoria;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Helper compartilhado de mapeamento de eventos e serialização iCalendar (RFC 5545).
 */
final class AgendaSupport {

    private static final DateTimeFormatter ICS_DATE = DateTimeFormatter.BASIC_ISO_DATE;
    private static final DateTimeFormatter ICS_TIME = DateTimeFormatter.ofPattern("HHmmss");

    private static final Map<HorarioAtendimento.DiaSemana, String> BYDAY = Map.of(
            HorarioAtendimento.DiaSemana.SEGUNDA, "MO",
            HorarioAtendimento.DiaSemana.TERCA, "TU",
            HorarioAtendimento.DiaSemana.QUARTA, "WE",
            HorarioAtendimento.DiaSemana.QUINTA, "TH",
            HorarioAtendimento.DiaSemana.SEXTA, "FR",
            HorarioAtendimento.DiaSemana.SABADO, "SA"
    );

    private static final Map<HorarioAtendimento.DiaSemana, DayOfWeek> DAY_OF_WEEK = Map.of(
            HorarioAtendimento.DiaSemana.SEGUNDA, DayOfWeek.MONDAY,
            HorarioAtendimento.DiaSemana.TERCA, DayOfWeek.TUESDAY,
            HorarioAtendimento.DiaSemana.QUARTA, DayOfWeek.WEDNESDAY,
            HorarioAtendimento.DiaSemana.QUINTA, DayOfWeek.THURSDAY,
            HorarioAtendimento.DiaSemana.SEXTA, DayOfWeek.FRIDAY,
            HorarioAtendimento.DiaSemana.SABADO, DayOfWeek.SATURDAY
    );

    private AgendaSupport() {
    }

    static String keyAbertura(Long vagaId) {
        return "VAGA_ABERTURA:" + vagaId;
    }

    static String keyEncerramento(Long vagaId) {
        return "VAGA_ENCERRAMENTO:" + vagaId;
    }

    static String keyHorario(Long horarioId) {
        return "HORARIO:" + horarioId;
    }

    static boolean vagaPublicavel(VagaMonitoria vaga) {
        return vaga.getStatus() == VagaMonitoria.StatusVaga.ABERTA
                || vaga.getStatus() == VagaMonitoria.StatusVaga.EM_SELECAO;
    }

    static List<EventoAgenda> construirEventosVaga(VagaMonitoria vaga, String codigoMateria, String nomeMateria) {
        if (!vagaPublicavel(vaga)) {
            return List.of();
        }
        String disciplina = formatDisciplina(codigoMateria, nomeMateria, vaga.getMateriaId());
        List<EventoAgenda> eventos = new ArrayList<>();
        if (vaga.getDataAbertura() != null) {
            eventos.add(new EventoAgenda(
                    keyAbertura(vaga.getId()),
                    EventoAgenda.TipoEventoAgenda.ABERTURA_VAGA,
                    vaga.getId(),
                    "Abertura de inscrições - " + disciplina,
                    "Semestre " + vaga.getSemestre() + " (" + vaga.getQuantidadeVagas() + " vaga(s))",
                    vaga.getDataAbertura(),
                    null,
                    null,
                    null,
                    null
            ));
        }
        if (vaga.getDataEncerramento() != null) {
            eventos.add(new EventoAgenda(
                    keyEncerramento(vaga.getId()),
                    EventoAgenda.TipoEventoAgenda.ENCERRAMENTO_VAGA,
                    vaga.getId(),
                    "Encerramento de inscrições - " + disciplina,
                    "Último dia para inscrição na monitoria (" + vaga.getSemestre() + ")",
                    vaga.getDataEncerramento(),
                    null,
                    null,
                    null,
                    null
            ));
        }
        return eventos;
    }

    static EventoAgenda construirEventoHorario(
            HorarioAtendimento horario,
            Long vagaId,
            String codigoMateria,
            String nomeMateria,
            String nomeMonitor) {
        String disciplina = formatDisciplina(codigoMateria, nomeMateria, vagaId);
        String local = horario.getLinkReuniao() != null && !horario.getLinkReuniao().isBlank()
                ? horario.getLocalAtendimento() + " (" + horario.getLinkReuniao() + ")"
                : horario.getLocalAtendimento();
        return new EventoAgenda(
                keyHorario(horario.getId()),
                EventoAgenda.TipoEventoAgenda.HORARIO_MONITORIA,
                horario.getId(),
                "Monitoria " + disciplina + " - " + nomeMonitor,
                "Atendimento semanal de monitoria",
                null,
                horario.getDiaSemana(),
                horario.getHoraInicio(),
                horario.getHoraFim(),
                local
        );
    }

    static List<EventoAgenda> ordenar(Collection<EventoAgenda> eventos) {
        return eventos.stream()
                .sorted(Comparator.comparing((EventoAgenda e) -> e.tipo().name())
                        .thenComparing(EventoAgenda::referenciaId))
                .toList();
    }

    static String formatarIcs(Collection<EventoAgenda> eventos, String prodId) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:").append(prodId).append("\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");

        LocalDate referenciaSemana = LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        for (EventoAgenda evento : ordenar(eventos)) {
            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:").append(evento.idExterno()).append("@monitoria.ufpr.br\r\n");
            sb.append("SUMMARY:").append(escapeIcs(evento.titulo())).append("\r\n");
            if (evento.descricao() != null) {
                sb.append("DESCRIPTION:").append(escapeIcs(evento.descricao())).append("\r\n");
            }
            if (evento.data() != null) {
                sb.append("DTSTART;VALUE=DATE:").append(evento.data().format(ICS_DATE)).append("\r\n");
                sb.append("DTEND;VALUE=DATE:").append(evento.data().plusDays(1).format(ICS_DATE)).append("\r\n");
            } else if (evento.diaSemana() != null && evento.horaInicio() != null && evento.horaFim() != null) {
                LocalDate dataBase = referenciaSemana.with(TemporalAdjusters.nextOrSame(DAY_OF_WEEK.get(evento.diaSemana())));
                sb.append("DTSTART:").append(dataBase.format(ICS_DATE)).append("T")
                        .append(formatTime(evento.horaInicio())).append("\r\n");
                sb.append("DTEND:").append(dataBase.format(ICS_DATE)).append("T")
                        .append(formatTime(evento.horaFim())).append("\r\n");
                sb.append("RRULE:FREQ=WEEKLY;BYDAY=").append(BYDAY.get(evento.diaSemana())).append("\r\n");
            }
            if (evento.localOuLink() != null && !evento.localOuLink().isBlank()) {
                sb.append("LOCATION:").append(escapeIcs(evento.localOuLink())).append("\r\n");
            }
            sb.append("END:VEVENT\r\n");
        }
        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    private static String formatDisciplina(String codigo, String nome, Long fallbackId) {
        if (codigo != null && !codigo.isBlank() && nome != null && !nome.isBlank()) {
            return codigo + " (" + nome + ")";
        }
        return "Disciplina #" + fallbackId;
    }

    private static String formatTime(LocalTime time) {
        return time.format(ICS_TIME);
    }

    private static String escapeIcs(String value) {
        return value.replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n");
    }
}
