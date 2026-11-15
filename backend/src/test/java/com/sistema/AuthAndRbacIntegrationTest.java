package com.sistema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthAndRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper mapper = new ObjectMapper();

    private JsonNode login(String email, String senha) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    @Test
    void catalogoPublicoERotasProtegidasExigemAutenticacao() throws Exception {
        mockMvc.perform(get("/api/v1/cursos"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/disciplinas"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/materias"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/cursos-disciplinas"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/vagas-monitoria"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/horarios-atendimento"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/cursos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"TEST\",\"nome\":\"Teste\",\"setor\":\"Exatas\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/disciplinas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"TEST1\",\"nome\":\"Teste\",\"departamento\":\"DInf\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/usuarios"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginComCredenciaisInvalidasRetorna401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"lucas.silva@ufpr.br\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo", is("UNAUTHORIZED")));
    }

    @Test
    void diferenciaAlunoDeMonitorEmHorariosEAtividades() throws Exception {
        JsonNode gabrielAuth = login("gabriel.santos@ufpr.br", "monitoria123");
        String gabrielToken = gabrielAuth.get("token").asText();
        long gabrielId = gabrielAuth.get("usuario").get("id").asLong();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + gabrielToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipoUsuario", is("ALUNO")))
                .andExpect(jsonPath("$.monitor", is(false)));

        // Aluno nao-monitor nao pode cadastrar horario nem registro de outro monitor
        mockMvc.perform(post("/api/v1/horarios-atendimento")
                        .header("Authorization", "Bearer " + gabrielToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monitorId\":1,\"diaSemana\":\"SEXTA\",\"horaInicio\":\"14:00\",\"horaFim\":\"16:00\",\"localAtendimento\":\"Lab 1\"}"))
                .andExpect(status().isForbidden());

        // Aluno pode se candidatar em vaga aberta (vaga 2 = CM041 ABERTA) usando seu proprio ID
        mockMvc.perform(post("/api/v1/candidaturas")
                        .header("Authorization", "Bearer " + gabrielToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagaId\":2,\"alunoId\":" + gabrielId + ",\"notaDisciplina\":88.5,\"cr\":80.0,\"justificativa\":\"Interesse em monitoria\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.alunoId", is((int) gabrielId)));

        // Monitor ativo (Lucas) possui flag monitor=true e pode cadastrar horario no proprio vinculo
        JsonNode lucasAuth = login("lucas.silva@ufpr.br", "monitoria123");
        String lucasToken = lucasAuth.get("token").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + lucasToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipoUsuario", is("ALUNO")))
                .andExpect(jsonPath("$.monitor", is(true)));

        mockMvc.perform(post("/api/v1/horarios-atendimento")
                        .header("Authorization", "Bearer " + lucasToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monitorId\":1,\"diaSemana\":\"SEXTA\",\"horaInicio\":\"15:00\",\"horaFim\":\"17:00\",\"localAtendimento\":\"Lab 3\"}"))
                .andExpect(status().isCreated());

        // Monitor nao pode aprovar o proprio registro de atividade
        mockMvc.perform(patch("/api/v1/registros-atividades/3/aprovacao")
                        .header("Authorization", "Bearer " + lucasToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statusAprovacao\":\"APROVADO\",\"feedbackProfessor\":\"Auto-aprovacao\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void professorEAdminRespeitamPermissoes() throws Exception {
        JsonNode profAuth = login("carlos.eduardo@ufpr.br", "monitoria123");
        String profToken = profAuth.get("token").asText();
        long profId = profAuth.get("usuario").get("id").asLong();

        // Professor nao pode cadastrar cursos nem disciplinas/materias (exclusivo ADMIN)
        mockMvc.perform(post("/api/v1/cursos")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"FIS\",\"nome\":\"Física\",\"setor\":\"Exatas\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/disciplinas")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"CF001\",\"nome\":\"Física 1\",\"departamento\":\"DFis\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/materias")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"disciplinaId\":1,\"nome\":\"Ponteiros\",\"descricao\":\"Alocação\"}"))
                .andExpect(status().isForbidden());

        // Professor cria vaga para si mesmo
        mockMvc.perform(post("/api/v1/vagas-monitoria")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"disciplinaId\":2,\"professorId\":" + profId + ",\"semestre\":\"2026/2\",\"quantidadeVagas\":1,\"tipoVaga\":\"VOLUNTARIA\",\"requisitos\":\"Aprovado\",\"descricao\":\"Apoio\"}"))
                .andExpect(status().isCreated());

        // Admin cadastra curso, disciplina, matéria e novo usuario com senha hash
        JsonNode adminAuth = login("coordenacao.dinf@ufpr.br", "monitoria123");
        String adminToken = adminAuth.get("token").asText();

        mockMvc.perform(post("/api/v1/cursos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"FIS\",\"nome\":\"Física\",\"setor\":\"Setor de Ciências Exatas\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo", is("FIS")));

        MvcResult discRes = mockMvc.perform(post("/api/v1/disciplinas")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"CF001\",\"nome\":\"Física 1\",\"departamento\":\"DFis\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo", is("CF001")))
                .andReturn();
        long discId = mapper.readTree(discRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/v1/materias")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"disciplinaId\":" + discId + ",\"nome\":\"Cinemática\",\"descricao\":\"Movimento retilíneo e circular\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.disciplinaId", is((int) discId)));

        mockMvc.perform(post("/api/v1/usuarios")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Novo Aluno\",\"email\":\"novo.aluno@ufpr.br\",\"tipoUsuario\":\"ALUNO\",\"matricula\":\"GRR20269999\",\"cursoId\":1,\"senha\":\"segredo123\"}"))
                .andExpect(status().isCreated());

        login("novo.aluno@ufpr.br", "segredo123");
    }
}
