export interface Departamento {
  ubigeo: string
  nombre: string
}

export interface Totales {
  actasContabilizadas: number
  contabilizadas: number
  totalActas: number
  participacionCiudadana: number
  totalVotosEmitidos: number
  totalVotosValidos: number
  porcentajeVotosEmitidos: number
  porcentajeVotosValidos: number
  enviadasJee: number
  pendientesJee: number
}

export interface Participante {
  nombreAgrupacionPolitica: string
  codigoAgrupacionPolitica: number
  nombreCandidato: string
  dniCandidato: string
  totalVotosValidos: number
  porcentajeVotosValidos: number
  porcentajeVotosEmitidos: number
}

export interface RegionResult {
  region: string
  totalActas: number
  contabilizadas: number
  enviadasJee: number
  pendientesJee: number
  actasPendientes: number
  diferenciaContJee: number
  actasContabilizadasPct: number
  votosEnvJeeEst: number
  votosPendientesEstimados: number
  votosEmitidos: number
  votosValidos: number
  votosBlancoNulos: number
  votosRoberto: number
  votosKeiko: number
  pctRoberto: number
  pctKeiko: number
  extraRoberto: number
  extraKeiko: number
  extraRobertoEnvJee: number
  extraRobertoPend: number
  extraKeikoEnvJee: number
  extraKeikoPend: number
  diferenciaNeta: number
}
