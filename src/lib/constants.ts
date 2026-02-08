// Estados de pedidos
export const REQUEST_STATUS = {
  NEW: 'NEW',
  TRIAGE: 'TRIAGE',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo',
  TRIAGE: 'Em Triagem',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em Curso',
  DONE: 'Concluído',
  CANCELLED: 'Cancelado',
};

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  TRIAGE: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  DONE: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// Estados de ofertas
export const OFFER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export const OFFER_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservada',
  IN_PROGRESS: 'Em Curso',
  DONE: 'Concluída',
  CANCELLED: 'Cancelada',
};

export const OFFER_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  DONE: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// Estados de matches
export const MATCH_STATUS = {
  PROPOSED: 'PROPOSED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  DONE: 'DONE',
} as const;

export const MATCH_STATUS_LABELS: Record<string, string> = {
  PROPOSED: 'Proposto',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  DONE: 'Concluído',
};

export const MATCH_STATUS_COLORS: Record<string, string> = {
  PROPOSED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DONE: 'bg-gray-100 text-gray-800',
};

// Disponibilidade de distância
export const DISTANCE_AVAILABILITY = {
  LOCAL: 'LOCAL',
  UP_TO_1H: 'UP_TO_1H',
  ANY: 'ANY',
} as const;

export const DISTANCE_LABELS: Record<string, string> = {
  LOCAL: 'Apenas local',
  UP_TO_1H: 'Até 1 hora',
  ANY: 'Qualquer distância',
};

// Necessidades especiais
export const SPECIAL_NEEDS_OPTIONS = [
  { value: 'elderly', label: 'Idosos' },
  { value: 'reduced_mobility', label: 'Mobilidade Reduzida' },
  { value: 'children', label: 'Crianças' },
  { value: 'wheelchair', label: 'Cadeira de Rodas' },
];

// Equipamento
export const EQUIPMENT_OPTIONS = [
  { value: 'trailer', label: 'Reboque' },
  { value: 'tools_space', label: 'Espaço para Ferramentas' },
  { value: 'large_cargo', label: 'Carga Grande' },
  { value: 'pet_friendly', label: 'Aceita Animais' },
];

// Tipos de veículo
export const VEHICLE_TYPES = [
  { value: 'car', label: 'Carro' },
  { value: 'van', label: 'Carrinha' },
  { value: 'suv', label: 'SUV/Jipe' },
  { value: 'truck', label: 'Camioneta' },
];
