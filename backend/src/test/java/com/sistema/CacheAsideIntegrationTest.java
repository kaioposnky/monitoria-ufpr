package com.sistema;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.AtualizacaoCursoDTO;
import com.sistema.dto.request.CadastroCursoDTO;
import com.sistema.repository.CursoRepository;
import com.sistema.repository.HorarioAtendimentoRepository;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.VagaMonitoriaRepository;
import com.sistema.service.CursoService;
import com.sistema.service.HorarioAtendimentoService;
import com.sistema.service.MonitorService;
import com.sistema.service.VagaMonitoriaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

@SpringBootTest
@ActiveProfiles("test")
class CacheAsideIntegrationTest {

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private CursoService cursoService;

    @Autowired
    private VagaMonitoriaService vagaService;

    @Autowired
    private MonitorService monitorService;

    @Autowired
    private HorarioAtendimentoService horarioService;

    @MockitoSpyBean
    private CursoRepository cursoRepository;

    @MockitoSpyBean
    private VagaMonitoriaRepository vagaRepository;

    @MockitoSpyBean
    private MonitorRepository monitorRepository;

    @MockitoSpyBean
    private HorarioAtendimentoRepository horarioRepository;

    @BeforeEach
    void clearCaches() {
        cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());
    }

    @Test
    void usesConcurrentMapCacheManager() {
        assertThat(cacheManager).isInstanceOf(ConcurrentMapCacheManager.class);
    }

    @Test
    void cursoCacheAsideHitMissAndInvalidation() {
        var criado = cursoService.criar(new CadastroCursoDTO("BCC-TEST", "Ciência da Computação", "Exatas"));

        // Miss on first list, hit on second
        cursoService.listar();
        cursoService.listar();
        verify(cursoRepository, times(1)).findAll();

        // Miss on first detail, hit on second
        var buscado1 = cursoService.buscar(criado.id());
        var buscado2 = cursoService.buscar(criado.id());
        assertThat(buscado2).isEqualTo(buscado1);
        verify(cursoRepository, times(1)).findById(criado.id());

        // Update invalidates both list and detail
        cursoService.atualizar(criado.id(), new AtualizacaoCursoDTO("BCC-TEST", "BCC Atualizado", "Exatas"));
        assertThat(cacheManager.getCache(CacheNames.CURSOS_LIST).get("SimpleKey []")).isNull();
        assertThat(cacheManager.getCache(CacheNames.CURSOS_DETAIL).get(criado.id())).isNull();

        var atualizado = cursoService.buscar(criado.id());
        assertThat(atualizado.nome()).isEqualTo("BCC Atualizado");
        // buscar (1) + atualizar (1) + buscar após invalidação (1)
        verify(cursoRepository, times(3)).findById(criado.id());

        // Delete invalidates both list and detail
        cursoService.excluir(criado.id());
        cursoService.listar();
        verify(cursoRepository, times(2)).findAll();
    }

    @Test
    void vagasMonitoresEHorariosUsamCacheAside() {
        vagaService.listar();
        vagaService.listar();
        verify(vagaRepository, times(1)).findAll();

        monitorService.listar();
        monitorService.listar();
        monitorService.porVaga(999L);
        monitorService.porVaga(999L);
        monitorService.porAluno(999L);
        monitorService.porAluno(999L);
        verify(monitorRepository, times(1)).findAll();
        verify(monitorRepository, times(1)).findByVagaId(999L);
        verify(monitorRepository, times(1)).findByAlunoId(999L);

        horarioService.listar();
        horarioService.listar();
        horarioService.porMonitor(999L);
        horarioService.porMonitor(999L);
        verify(horarioRepository, times(1)).findAll();
        verify(horarioRepository, times(1)).findByMonitorId(999L);
    }
}
