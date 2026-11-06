const labels: Record<string, string> = {
  ABERTA: 'Aberta',
  EM_SELECAO: 'Em seleção',
  ENCERRADA: 'Encerrada',
  CANCELADA: 'Cancelada',
  REMUNERADA: 'Remunerada',
  VOLUNTARIA: 'Voluntária',
};

export function catalogLabel(value: string): string {
  return labels[value] ?? value;
}

export const vacancyTypeOptions = [
  { value: 'REMUNERADA', label: catalogLabel('REMUNERADA') },
  { value: 'VOLUNTARIA', label: catalogLabel('VOLUNTARIA') },
];

export const vacancyStatusOptions = [
  { value: 'ABERTA', label: catalogLabel('ABERTA') },
  { value: 'EM_SELECAO', label: catalogLabel('EM_SELECAO') },
  { value: 'ENCERRADA', label: catalogLabel('ENCERRADA') },
  { value: 'CANCELADA', label: catalogLabel('CANCELADA') },
];
