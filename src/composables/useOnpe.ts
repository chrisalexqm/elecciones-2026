import { ref, computed } from 'vue'
import type { Totales, RegionResult } from '@/types'

export function useOnpe() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cargandoRegion = ref('')
  const progreso = ref(0)
  const resultados = ref<RegionResult[]>([])
  const totalesRaw = ref<Totales[]>([])
  const timestamp = ref<string>('')

  const totalActasContabilizadas = computed(() => {
    return totalesRaw.value.reduce((sum: number, t: Totales) => sum + t.contabilizadas, 0)
  })

  const totalActasEnviadasJee = computed(() => {
    return totalesRaw.value.reduce((sum: number, t: Totales) => sum + (t.enviadasJee ?? 0), 0)
  })

  const totalActasPendientesJee = computed(() => {
    return totalesRaw.value.reduce((sum: number, t: Totales) => sum + (t.pendientesJee ?? 0), 0)
  })

  const totalActas = computed(() => {
    return totalesRaw.value.reduce((sum: number, t: Totales) => sum + t.totalActas, 0)
  })

  const pctActasContabilizadas = computed(() => {
    return totalActas.value > 0 ? (totalActasContabilizadas.value / totalActas.value) * 100 : 0
  })

  const pctActasEnviadasJee = computed(() => {
    return totalActas.value > 0 ? (totalActasEnviadasJee.value / totalActas.value) * 100 : 0
  })

  const pctActasPendientesJee = computed(() => {
    return totalActas.value > 0 ? (totalActasPendientesJee.value / totalActas.value) * 100 : 0
  })

  const totalVotosContabilizados = computed(() => {
    return totalesRaw.value.reduce((sum: number, t: Totales) => sum + t.totalVotosValidos, 0)
  })

  const totalVotosProyectados = computed(() => {
    return totalVotosContabilizados.value + totalVotosPendientes.value
  })

  const diferenciaContabilizadasJee = computed(() => {
    return totalActasContabilizadas.value - totalActasEnviadasJee.value
  })

  const ventajaFinal = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.diferenciaNeta, 0)
  })

  const totalVotosRobertoContado = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.votosRoberto, 0)
  })

  const totalVotosKeikoContado = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.votosKeiko, 0)
  })

  const ventajaConteo = computed(() => {
    return totalVotosRobertoContado.value - totalVotosKeikoContado.value
  })

  const ventajaTotal = computed(() => {
    return ventajaConteo.value + ventajaFinal.value
  })

  const totalVotosEnvJeeEst = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.votosEnvJeeEst, 0)
  })

  const totalVotosPendientes = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.votosEnvJeeEst + r.votosPendientesEstimados, 0)
  })

  const totalExtraRoberto = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.extraRoberto, 0)
  })

  const totalExtraKeiko = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.extraKeiko, 0)
  })

  const totalExtraRobertoEnvJee = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.extraRobertoEnvJee, 0)
  })

  const totalExtraRobertoPend = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.extraRobertoPend, 0)
  })

  const totalExtraKeikoEnvJee = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.extraKeikoEnvJee, 0)
  })

  const totalExtraKeikoPend = computed(() => {
    return resultados.value.reduce((sum: number, r: RegionResult) => sum + r.extraKeikoPend, 0)
  })

  const top3Pendientes = computed(() => {
    return [...resultados.value]
      .sort((a: RegionResult, b: RegionResult) => b.votosPendientesEstimados - a.votosPendientesEstimados)
      .slice(0, 3)
      .map((r: RegionResult) => ({ region: r.region, actas: r.pendientesJee, votos: r.votosPendientesEstimados }))
  })

  const top3EnviadasJee = computed(() => {
    return [...resultados.value]
      .sort((a: RegionResult, b: RegionResult) => b.votosEnvJeeEst - a.votosEnvJeeEst)
      .slice(0, 3)
      .map((r: RegionResult) => ({ region: r.region, actas: r.enviadasJee, votos: r.votosEnvJeeEst }))
  })

  const maxExtraRoberto = computed(() => {
    return resultados.value.length > 0
      ? Math.max(...resultados.value.map((r: RegionResult) => r.extraRoberto))
      : 0
  })

  const maxExtraKeiko = computed(() => {
    return resultados.value.length > 0
      ? Math.max(...resultados.value.map((r: RegionResult) => r.extraKeiko))
      : 0
  })

  async function cargarDatos() {
    loading.value = true
    error.value = null
    cargandoRegion.value = 'Cargando datos...'
    progreso.value = 0
    resultados.value = []

    try {
      const url = `${import.meta.env.BASE_URL}data.json`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar data.json`)
      const data = await res.json()
      resultados.value = data.resultados as RegionResult[]
      totalesRaw.value = data.totalesRaw as Totales[]
      timestamp.value = data.timestamp as string
      cargandoRegion.value = ''
      progreso.value = 25
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
      cargandoRegion.value = ''
    }
  }

  return {
    loading,
    error,
    cargandoRegion,
    progreso,
    resultados,
    ventajaFinal,
    totalVotosPendientes,
    totalVotosEnvJeeEst,
    totalExtraRoberto,
    totalExtraKeiko,
    totalExtraRobertoEnvJee,
    totalExtraRobertoPend,
    totalExtraKeikoEnvJee,
    totalExtraKeikoPend,
    totalActasContabilizadas,
    totalActasEnviadasJee,
    totalActasPendientesJee,
    totalActas,
    pctActasContabilizadas,
    pctActasEnviadasJee,
    pctActasPendientesJee,
    totalVotosContabilizados,
    totalVotosProyectados,
    diferenciaContabilizadasJee,
    top3Pendientes,
    top3EnviadasJee,
    maxExtraRoberto,
    maxExtraKeiko,
    totalVotosRobertoContado,
    totalVotosKeikoContado,
    ventajaConteo,
    ventajaTotal,
    timestamp,
    cargarDatos,
  }
}
