import { getResources, type ResourceDefinition, type ResourceField } from './resources.js';

const escapeHtml = (value: unknown): string =>
  formatValue(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const layout = (title: string, content: string, notice = '') => `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Monitoria UFPR Exatas</title><link rel="stylesheet" href="/styles.css"></head>
<body><header class="topbar"><a class="brand" href="/">Monitoria UFPR <span>Exatas</span></a>
<nav><a href="/">Início</a>${getResources().map((resource) => `<a href="${resource.path}">${escapeHtml(resource.label)}</a>`).join('')}</nav></header>
<main class="container">${notice ? `<div class="notice error" role="alert">${escapeHtml(notice)}</div>` : ''}${content}</main>
<footer>Frontend SSR NestJS · API <code>/api/v1</code> · Backend <a href="http://localhost:8080/swagger-ui.html">Swagger</a> · <a href="http://localhost:8080/v3/api-docs">OpenAPI</a></footer>
</body></html>`;

export function renderDashboard(notice = ''): string {
  const cards = getResources()
    .map(
      (resource) =>
        `<a class="card" href="${resource.path}"><strong>${escapeHtml(resource.label)}</strong><span>${escapeHtml(resource.description)}</span></a>`,
    )
    .join('');
  return layout(
    'Painel',
    `<section class="hero"><p class="eyebrow">UFPR · Ciências Exatas</p><h1>Organize a monitoria com clareza.</h1><p>Consulte e mantenha cursos, matérias, vagas, candidaturas, monitores, horários e atividades em um só lugar.</p></section><section class="grid">${cards}</section>`,
    notice,
  );
}

export function renderResourcePage(
  definition: ResourceDefinition,
  records: unknown[],
  related: Record<string, unknown[]>,
  error = '',
  values: Record<string, string> = {},
): string {
  const rows = records.map((record) => {
    const data = isObject(record) ? record : { value: record };
    const id = data.id ?? data['uuid'] ?? '';
    const cells = definition.fields
      .map((field) => `<td>${escapeHtml(formatValue(data[field.key]))}</td>`)
      .join('');
    return `<tr><td><code>${escapeHtml(id)}</code></td>${cells}<td class="actions"><form method="post" action="/${definition.key}/${encodeURIComponent(String(id))}/delete"><button class="link danger" type="submit">Excluir</button></form></td></tr>`;
  }).join('');
  const success = error ? `<div class="notice error" role="alert">${escapeHtml(error)}</div>` : '';
  return layout(
    definition.label,
    `${success}<div class="page-heading"><div><p class="eyebrow">Cadastro</p><h1>${escapeHtml(definition.label)}</h1><p>${escapeHtml(definition.description)}</p></div></div>
    <div class="columns"><section class="panel"><h2>Adicionar ${escapeHtml(definition.singular.toLowerCase())}</h2><form method="post" action="/${definition.key}" class="form">${definition.fields.map((field) => renderField(field, related, values)).join('')}<button class="primary" type="submit">Salvar registro</button></form></section>
    <section class="panel table-panel"><h2>Registros</h2>${records.length ? `<div class="table-wrap"><table><thead><tr><th>ID</th>${definition.fields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join('')}<th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="empty">Nenhum registro disponível. Verifique a conexão com o backend ou cadastre o primeiro item.</p>'}</section></div>`,
  );
}

function renderField(field: ResourceField, related: Record<string, unknown[]>, values: Record<string, string>): string {
  const value = values[field.key] ?? '';
  const required = field.required ? ' required' : '';
  if (field.type === 'select' && field.relation) {
    const options = (related[field.relation] ?? [])
      .map((item) => {
        const data = isObject(item) ? item : { id: item };
        const id = data.id ?? data.uuid ?? '';
        const label = data.name ?? data.title ?? data.email ?? id;
        return `<option value="${escapeHtml(id)}"${String(id) === value ? ' selected' : ''}>${escapeHtml(label)}</option>`;
      })
      .join('');
    return `<label>${escapeHtml(field.label)}<select name="${escapeHtml(field.key)}"${required}><option value="">Selecione</option>${options}</select>${field.help ? `<small>${escapeHtml(field.help)}</small>` : ''}</label>`;
  }
  const control = field.type === 'textarea'
    ? `<textarea name="${escapeHtml(field.key)}"${required}>${escapeHtml(value)}</textarea>`
    : `<input type="${field.type}" name="${escapeHtml(field.key)}" value="${escapeHtml(value)}"${required}>`;
  return `<label>${escapeHtml(field.label)}${control}${field.help ? `<small>${escapeHtml(field.help)}</small>` : ''}</label>`;
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  return '—';
}
