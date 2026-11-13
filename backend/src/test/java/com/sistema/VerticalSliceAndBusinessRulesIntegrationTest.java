package com.sistema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistema.integration.notificacao.NotificacaoMensagem;
import com.sistema.integration.notificacao.NotificadorFake;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class VerticalSliceAndBusinessRulesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificadorFake notificadorFake;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void limparHistoricoNotificacoes() {
        notificadorFake.limparHistorico();
    }

    private JsonNode login(String email, String senha) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    @Test
    void fluxoVerticalCompletoComAgendaENotificador() throws Exception {
        JsonNode profAuth = login("carlos.eduardo@ufpr.br", "monitoria123");
        String profToken = profAuth.get("token").asText();
        long profId = profAuth.get("usuario").get("id").asLong();

        LocalDate hoje = LocalDate.now();
        String abertura = hoje.minusDays(1).toString();
        String encerramento = hoje.plusDays(15).toString();

        // 1. Professor cria vaga com janela de inscrições (sincroniza na agenda)
        MvcResult vagaRes = mockMvc.perform(post("/api/v1/vagas-monitoria")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materiaId\":5,\"professorId\":" + profId
                                + ",\"semestre\":\"2026/2\",\"quantidadeVagas\":1,\"tipoVaga\":\"REMUNERADA\","
                                + "\"requisitos\":\"Aprovado em CM005\",\"descricao\":\"Apoio em Algebra Linear\","
                                + "\"dataAbertura\":\"" + abertura + "\",\"dataEncerramento\":\"" + encerramento + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dataAbertura", is(abertura)))
                .andExpect(jsonPath("$.dataEncerramento", is(encerramento)))
                .andReturn();
        long vagaId = mapper.readTree(vagaRes.getResponse().getContentAsString()).get("id").asLong();

        // Agenda contém abertura e encerramento da vaga e exporta ICS válido
        MvcResult eventosRes = mockMvc.perform(get("/api/v1/agenda/eventos"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode eventos = mapper.readTree(eventosRes.getResponse().getContentAsString());
        assertThat(eventos.toString())
                .contains("VAGA_ABERTURA:" + vagaId)
                .contains("VAGA_ENCERRAMENTO:" + vagaId);

        mockMvc.perform(get("/api/v1/agenda/calendario.ics"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("BEGIN:VCALENDAR")))
                .andExpect(content().string(containsString("VAGA_ABERTURA:" + vagaId)));

        // 2. Aluna Ana Paula candidata-se à vaga aberta dentro do prazo
        JsonNode anaAuth = login("ana.ribeiro@ufpr.br", "monitoria123");
        String anaToken = anaAuth.get("token").asText();
        long anaId = anaAuth.get("usuario").get("id").asLong();

        MvcResult candRes = mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + anaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":" + vagaId + ",\"alunoId\":" + anaId
                                + ",\"notaDisciplina\":90.0,\"cr\":84.0,\"justificativa\":\"Disponibilidade integral\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDENTE")))
                .andReturn();
        long candidaturaId = mapper.readTree(candRes.getResponse().getContentAsString()).get("id").asLong();

        // Duplicidade na mesma vaga deve retornar 409
        mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + anaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":" + vagaId + ",\"alunoId\":" + anaId
                                + ",\"notaDisciplina\":90.0,\"cr\":84.0,\"justificativa\":\"Tentativa repetida\"}"))
                .andExpect(status().isConflict());

        // 3. Professor aprova candidatura e efetiva monitora
        mockMvc.perform(patch("/api/v1/candidaturas/" + candidaturaId + "/status")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APROVADO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APROVADO")));

        MvcResult monitorRes = mockMvc.perform(post("/api/v1/monitores")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":" + vagaId + ",\"alunoId\":" + anaId + ",\"candidaturaId\":" + candidaturaId
                                + ",\"cargaHorariaSemanal\":12,\"dataInicio\":\"" + hoje + "\",\"dataFim\":\"" + hoje.plusMonths(4) + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("ATIVO")))
                .andReturn();
        long monitorId = mapper.readTree(monitorRes.getResponse().getContentAsString()).get("id").asLong();

        // Tentar efetivar segundo monitor além do limite de quantidadeVagas=1 deve falhar com 409
        JsonNode gabrielAuth = login("gabriel.santos@ufpr.br", "monitoria123");
        long gabrielId = gabrielAuth.get("usuario").get("id").asLong();
        mockMvc.perform(post("/api/v1/monitores")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":" + vagaId + ",\"alunoId\":" + gabrielId
                                + ",\"cargaHorariaSemanal\":12,\"dataInicio\":\"" + hoje + "\"}"))
                .andExpect(status().isConflict());

        // 4. Nova monitora cadastra horário de atendimento (sincroniza na agenda com RRULE semanal)
        MvcResult horarioRes = mockMvc.perform(post("/api/v1/horarios-atendimento")
                        .header("Authorization", "Bearer " + anaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monitorId\":" + monitorId + ",\"diaSemana\":\"QUARTA\",\"horaInicio\":\"16:00\","
                                + "\"horaFim\":\"18:00\",\"localAtendimento\":\"Sala PA-04\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        long horarioId = mapper.readTree(horarioRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/v1/agenda/calendario.ics"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("HORARIO:" + horarioId)))
                .andExpect(content().string(containsString("RRULE:FREQ=WEEKLY;BYDAY=WE")));

        // 5. Monitora registra atividade e professor avalia
        MvcResult atividadeRes = mockMvc.perform(post("/api/v1/registros-atividades")
                        .header("Authorization", "Bearer " + anaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monitorId\":" + monitorId + ",\"dataAtividade\":\"" + hoje + "\","
                                + "\"horaInicio\":\"16:00\",\"horaFim\":\"18:00\",\"tipoAtividade\":\"ATENDIMENTO_DUVIDAS\","
                                + "\"descricao\":\"Resolução de sistemas lineares\",\"quantidadeAlunosAtendidos\":4}"))
                .andExpect(status().isCreated())
                .andReturn();
        long atividadeId = mapper.readTree(atividadeRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/v1/registros-atividades/" + atividadeId + "/aprovacao")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statusAprovacao\":\"APROVADO\",\"feedbackProfessor\":\"Registro conferido\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusAprovacao", is("APROVADO")));

        // Verifica que todas as etapas acionaram o NotificadorFake
        assertThat(notificadorFake.listarHistorico())
                .extracting(reg -> reg.mensagem().tipo())
                .contains(
                        NotificacaoMensagem.TipoNotificacao.CANDIDATURA_REGISTRADA,
                        NotificacaoMensagem.TipoNotificacao.CANDIDATURA_AVALIADA,
                        NotificacaoMensagem.TipoNotificacao.MONITOR_EFETIVADO,
                        NotificacaoMensagem.TipoNotificacao.ATIVIDADE_AVALIADA);

        // 6. Remoção de horário limpa evento da agenda
        mockMvc.perform(delete("/api/v1/horarios-atendimento/" + horarioId)
                        .header("Authorization", "Bearer " + anaToken))
                .andExpect(status().isNoContent());

        MvcResult eventosPosDelete = mockMvc.perform(get("/api/v1/agenda/eventos"))
                .andExpect(status().isOk())
                .andReturn();
        assertThat(eventosPosDelete.getResponse().getContentAsString())
                .doesNotContain("HORARIO:" + horarioId);
    }

    @Test
    void rejeitaRegrasDeNegocioEPeriodosInvalidos() throws Exception {
        JsonNode profAuth = login("mariana.silveira@ufpr.br", "monitoria123");
        String profToken = profAuth.get("token").asText();
        long profId = profAuth.get("usuario").get("id").asLong();

        JsonNode gabrielAuth = login("gabriel.santos@ufpr.br", "monitoria123");
        String gabrielToken = gabrielAuth.get("token").asText();
        long gabrielId = gabrielAuth.get("usuario").get("id").asLong();

        LocalDate hoje = LocalDate.now();

        // Data de encerramento anterior à de abertura deve retornar 409
        mockMvc.perform(post("/api/v1/vagas-monitoria")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materiaId\":4,\"professorId\":" + profId
                                + ",\"semestre\":\"2026/2\",\"quantidadeVagas\":1,\"tipoVaga\":\"VOLUNTARIA\","
                                + "\"dataAbertura\":\"" + hoje.plusDays(5) + "\",\"dataEncerramento\":\"" + hoje.plusDays(2) + "\"}"))
                .andExpect(status().isConflict());

        // Vaga ainda não aberta para inscrições (abertura futura)
        MvcResult vagaFuturaRes = mockMvc.perform(post("/api/v1/vagas-monitoria")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materiaId\":4,\"professorId\":" + profId
                                + ",\"semestre\":\"2026/2\",\"quantidadeVagas\":1,\"tipoVaga\":\"VOLUNTARIA\","
                                + "\"dataAbertura\":\"" + hoje.plusDays(2) + "\",\"dataEncerramento\":\"" + hoje.plusDays(10) + "\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        long vagaFuturaId = mapper.readTree(vagaFuturaRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + gabrielToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":" + vagaFuturaId + ",\"alunoId\":" + gabrielId + "}"))
                .andExpect(status().isConflict());

        // Vaga com prazo de inscrições já encerrado
        MvcResult vagaExpiradaRes = mockMvc.perform(post("/api/v1/vagas-monitoria")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materiaId\":4,\"professorId\":" + profId
                                + ",\"semestre\":\"2026/2\",\"quantidadeVagas\":1,\"tipoVaga\":\"VOLUNTARIA\","
                                + "\"dataAbertura\":\"" + hoje.minusDays(10) + "\",\"dataEncerramento\":\"" + hoje.minusDays(1) + "\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        long vagaExpiradaId = mapper.readTree(vagaExpiradaRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + gabrielToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":" + vagaExpiradaId + ",\"alunoId\":" + gabrielId + "}"))
                .andExpect(status().isConflict());

        // Vaga 3 em V2 está EM_SELECAO: não pode receber candidaturas
        mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + gabrielToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":3,\"alunoId\":" + gabrielId + "}"))
                .andExpect(status().isConflict());

        // Vaga inexistente retorna 404
        mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + gabrielToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":99999,\"alunoId\":" + gabrielId + "}"))
                .andExpect(status().isNotFound());

        // Horário de atendimento com fim <= início retorna 409 (Lucas é monitor 1)
        JsonNode lucasAuth = login("lucas.silva@ufpr.br", "monitoria123");
        String lucasToken = lucasAuth.get("token").asText();
        mockMvc.perform(post("/api/v1/horarios-atendimento")
                        .header("Authorization", "Bearer " + lucasToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monitorId\":1,\"diaSemana\":\"SEXTA\",\"horaInicio\":\"16:00\",\"horaFim\":\"15:00\",\"localAtendimento\":\"Lab 1\"}"))
                .andExpect(status().isConflict());

        // Professor não pode alterar vaga de outro professor (vaga 1 pertence a Carlos)
        mockMvc.perform(patch("/api/v1/vagas-monitoria/1")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CANCELADA\"}"))
                .andExpect(status().isForbidden());
    }
}
