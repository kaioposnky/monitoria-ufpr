import { useState } from 'react';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { VacancyCard } from '../../components/VacancyCard/VacancyCard';
import { VacancyFilters } from '../../components/VacancyFilters/VacancyFilters';
import {
  loadSubjects,
  loadVacancies,
} from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

export function VacanciesPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const vacanciesQuery = useQuery(loadVacancies);
  const subjectsQuery = useQuery(loadSubjects);

  const clearFilters = () => {
    setSearch('');
    setType('');
    setStatus('');
  };

  return (
    <>
      <PageHeader
        title="Vagas de monitoria"
        description="Busque por disciplina ou código e filtre por modalidade e situação."
      />
      <QueryResult {...vacanciesQuery}>
        {(vacancies) =>
          vacancies.length === 0 ? (
            <EmptyState
              title="Nenhuma vaga cadastrada"
              description="O backend não retornou vagas de monitoria para consulta."
            />
          ) : (
            <QueryResult {...subjectsQuery}>
              {(subjects) => {
                const subjectsById = new Map(
                  subjects.map((subject) => [subject.id, subject] as const),
                );
                const term = search.trim().toLocaleLowerCase('pt-BR');
                const filtered = vacancies.filter((vacancy) => {
                  if (type && vacancy.type !== type) return false;
                  if (status && vacancy.status !== status) return false;
                  if (!term) return true;
                  const subject = subjectsById.get(vacancy.subjectId);
                  if (!subject) return false;
                  return (
                    subject.name.toLocaleLowerCase('pt-BR').includes(term) ||
                    subject.code.toLocaleLowerCase('pt-BR').includes(term)
                  );
                });

                return (
                  <>
                    <VacancyFilters
                      search={search}
                      type={type}
                      status={status}
                      total={vacancies.length}
                      matched={filtered.length}
                      onSearchChange={setSearch}
                      onTypeChange={setType}
                      onStatusChange={setStatus}
                      onClear={clearFilters}
                    />
                    {filtered.length === 0 ? (
                      <>
                        <EmptyState
                          title="Nenhuma vaga corresponde aos filtros"
                          description="Ajuste a busca, a modalidade ou a situação para encontrar outras vagas."
                        />
                        <div className="form-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={clearFilters}
                          >
                            Limpar filtros
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="grid">
                        {filtered.map((vacancy) => (
                          <VacancyCard
                            key={vacancy.id}
                            vacancy={vacancy}
                            subject={
                              subjectsById.get(vacancy.subjectId) ?? null
                            }
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              }}
            </QueryResult>
          )
        }
      </QueryResult>
    </>
  );
}
