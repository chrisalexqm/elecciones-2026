<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useOnpe } from './composables/useOnpe'
import type { RegionResult } from './types'

const activeTab = ref<'conteo' | 'proyeccion' | 'total'>('conteo')

const tabs = [
  { id: 'conteo' as const, label: 'Conteo de votos por region' },
  { id: 'proyeccion' as const, label: 'Proyeccion (actas JEE)' },
  { id: 'total' as const, label: 'Total proyectado' },
]

const {
  loading,
  error,
  resultados,
  ventajaFinal,
  totalVotosPendientes,
  totalExtraRoberto,
  totalExtraKeiko,
  totalActasContabilizadas,
  totalActasEnviadasJee,
  totalActasPendientesJee,
  totalActas,
  pctActasContabilizadas,
  pctActasEnviadasJee,
  pctActasPendientesJee,
  cargandoRegion,
  progreso,
  totalVotosEnvJeeEst,
  totalVotosRobertoContado,
  totalVotosKeikoContado,
  ventajaConteo,
  ventajaTotal,
  top3Pendientes,
  top3EnviadasJee,
  maxExtraRoberto,
  maxExtraKeiko,
  totalExtraRobertoEnvJee,
  totalExtraRobertoPend,
  totalExtraKeikoEnvJee,
  totalExtraKeikoPend,
  timestamp,
  cargarDatos,
} = useOnpe()

function isTop3Pendiente(region: string): boolean {
  return top3Pendientes.value.some((t) => t.region === region)
}

function isTop3EnviadasJee(region: string): boolean {
  return top3EnviadasJee.value.some((t) => t.region === region)
}

const formattedTimestamp = computed(() => {
  if (!timestamp.value) return ''
  const d = new Date(timestamp.value)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `ACTUALIZADO AL ${dd}/${mm}/${yyyy} A LAS ${hh}:${min}:${ss}`
})

onMounted(() => {
  cargarDatos()
})

function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('es-PE')
}

function fmtPct(n: number): string {
  return n.toFixed(2) + '%'
}
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-6xl">
      <h1 class="mb-2 text-2xl font-bold text-gray-800">
        Conteo + Proyeccion de actas JEE - PERU
      </h1>
      <p class="mb-2 text-sm text-gray-500">
        Conteo oficial ONPE + proyeccion sobre el porcentaje obtenido por region de las actas que
        faltan resolver en el JEE. Historicamente el JEE valida entre 80% y 90% de las actas enviadas.
      </p>
      <p class="mb-6 text-xs text-gray-400">
        Nota: no incluye voto extranjero.
      </p>

      <div v-if="!loading && !error" class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">Actas contabilizadas</p>
            <p class="text-2xl font-bold text-emerald-600">{{ pctActasContabilizadas.toFixed(3) }} %</p>
          </div>
          <div class="text-sm text-gray-600">
            <p>Total de actas: <span class="font-semibold text-gray-800">{{ fmtNum(totalActas) }}</span></p>
            <p class="mt-0.5">
              Contabilizadas <span class="font-semibold text-emerald-600">({{ fmtNum(totalActasContabilizadas) }})</span>
              <span class="mx-1 text-gray-300">|</span>
              Para envio al JEE <span class="font-semibold text-amber-600">({{ fmtNum(totalActasEnviadasJee) }})</span>
              <span class="mx-1 text-gray-300">|</span>
              Pendientes <span class="font-semibold text-sky-600">({{ fmtNum(totalActasPendientesJee) }})</span>
            </p>
          </div>
          <div class="w-max text-sm">
            <p class="font-semibold text-gray-800">Top enviadas JEE</p>
            <ul class="mt-1 space-y-0.5 text-xs text-gray-600">
              <li v-for="r in top3EnviadasJee" :key="r.region">
                <span class="font-medium text-amber-700">{{ r.region }}</span>
                <span class="font-semibold text-gray-700"> - {{ fmtNum(r.actas) }} actas</span>
                <span class="block text-[10px] text-gray-400">{{ fmtNum(r.votos) }} votos</span>
              </li>
            </ul>
          </div>
          <div class="w-max text-sm">
            <p class="font-semibold text-gray-800">Top pendientes</p>
            <ul class="mt-1 space-y-0.5 text-xs text-gray-600">
              <li v-for="r in top3Pendientes" :key="r.region">
                <span class="font-medium text-amber-700">{{ r.region }}</span>
                <span class="font-semibold text-gray-700"> - {{ fmtNum(r.actas) }} actas</span>
                <span class="block text-[10px] text-gray-400">{{ fmtNum(r.votos) }} votos</span>
              </li>
            </ul>
          </div>
        </div>
        <p class="mt-3 text-xs font-bold uppercase tracking-wide text-gray-500">{{ formattedTimestamp }}</p>
      </div>

      <Transition name="fade">
        <div
          v-if="loading"
          class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
        >
          <div class="w-full max-w-md px-6 text-center">
            <div class="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
            <p class="text-lg font-semibold text-gray-800">Obteniendo datos...</p>
            <p class="mt-1 text-sm text-gray-500">{{ cargandoRegion }}</p>
            <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                class="h-full rounded-full bg-emerald-600 transition-all duration-300"
                :style="{ width: (progreso / 25 * 100) + '%' }"
              ></div>
            </div>
            <p class="mt-2 text-xs text-gray-400">{{ progreso }} de 25 regiones</p>
          </div>
        </div>
      </Transition>

      <div
        v-if="!loading && error"
        class="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700"
      >
        <p class="font-semibold">Error al cargar datos</p>
        <p class="text-sm">{{ error }}</p>
        <button
          class="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          @click="cargarDatos"
        >
          Reintentar
        </button>
      </div>

      <template v-if="!loading && !error">
        <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Conteo + Proyeccion (enviadas JEE y por contar)
        </p>
        <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Roberto Sanchez - Total
            </p>
            <p class="mt-1 text-2xl font-bold text-emerald-700">
              {{ fmtNum(totalVotosRobertoContado + totalExtraRoberto) }}
            </p>
            <p class="mt-1 text-[10px] text-gray-400">
              Conteo {{ fmtNum(totalVotosRobertoContado) }} + Env. JEE {{ fmtNum(totalExtraRobertoEnvJee) }} + Por contar {{ fmtNum(totalExtraRobertoPend) }}
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-orange-500">
              Keiko Fujimori - Total
            </p>
            <p class="mt-1 text-2xl font-bold text-orange-500">
              {{ fmtNum(totalVotosKeikoContado + totalExtraKeiko) }}
            </p>
            <p class="mt-1 text-[10px] text-gray-400">
              Conteo {{ fmtNum(totalVotosKeikoContado) }} + Env. JEE {{ fmtNum(totalExtraKeikoEnvJee) }} + Por contar {{ fmtNum(totalExtraKeikoPend) }}
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
              Ventaja conteo (sin proyeccion)
            </p>
            <p
              class="mt-1 text-2xl font-bold"
              :class="ventajaConteo >= 0 ? 'text-emerald-600' : 'text-orange-500'"
            >
              {{ fmtNum(Math.abs(ventajaConteo)) }}
            </p>
            <p class="mt-1 text-[10px] text-gray-400">
              {{ ventajaConteo >= 0 ? 'Roberto +' : 'Keiko +' }}
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
              Ventaja total proyectada
            </p>
            <p
              class="mt-1 text-2xl font-bold"
              :class="ventajaTotal >= 0 ? 'text-emerald-600' : 'text-orange-500'"
            >
              {{ fmtNum(Math.abs(ventajaTotal)) }}
            </p>
            <p class="mt-1 text-[10px] text-gray-400">
              {{ ventajaTotal >= 0 ? 'Roberto +' : 'Keiko +' }} | Conteo + Proyeccion actas JEE
            </p>
          </div>
        </div>

        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- TAB 2: Proyeccion -->
        <div v-if="activeTab === 'proyeccion'">
          <h2 class="mb-2 text-lg font-bold text-gray-800">Proyeccion sobre actas por contabilizar enviadas a JEE</h2>
          <div class="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <p class="font-semibold text-gray-700">Como se calculan los votos pendientes:</p>
            <p class="mt-1">
              votos_estimados = (votos_validos / actas_contabilizadas) × (actas_enviadas_jee + actas_pendientes_jee).
              Se asume que el promedio de votos por acta se mantiene igual en las actas que faltan.
            </p>
            <p class="mt-1 font-semibold text-gray-700">Diferencia entre columnas:</p>
            <p class="mt-1">
              <span class="text-amber-700 font-medium">Env. JEE</span> = actas enviadas al Jurado Electoral Especial para revision.
              <span class="text-rose-700 font-medium">Por contar</span> = actas que aun no ingresan al sistema ONPE.
              Son procesos distintos; algunas actas pueden estar en JEE pero ya contabilizadas, y viceversa.
            </p>
          </div>
          <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100 text-left text-xs font-semibold uppercase text-gray-600">
                <tr>
                  <th class="px-3 py-3 border-r-2 border-gray-300">Region</th>
                <th class="px-3 py-3 text-right">Total</th>
                <th class="px-3 py-3 text-right">Cont.</th>
                <th class="px-3 py-3 text-right">Env. JEE</th>
                <th class="px-3 py-3 text-right border-r-2 border-gray-300">Por contar</th>
                <th class="px-3 py-3 text-right">Votos Est. Env. JEE</th>
                <th class="px-3 py-3 text-right border-r-2 border-gray-300">Votos Est. Por contar</th>
                <th class="px-3 py-3 text-right">Extra Roberto</th>
                <th class="px-3 py-3 text-right border-r-2 border-gray-300">Extra Keiko</th>
                <th class="px-3 py-3 text-right">Ventaja</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="r in resultados"
                :key="r.region"
                class="hover:bg-gray-50"
              >
                <td class="px-3 py-3 font-medium text-gray-900 border-r-2 border-gray-300">{{ r.region }}</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ r.totalActas }}</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ r.contabilizadas }}</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ r.enviadasJee }}</td>
                <td class="px-3 py-3 text-right text-gray-700 border-r-2 border-gray-300">{{ r.pendientesJee }}</td>
                <td class="px-3 py-3 text-right text-gray-700">
                  <span
                    v-if="isTop3EnviadasJee(r.region)"
                    class="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800"
                    :title="'Top 3 mayor bolson de votos enviadas al JEE: ' + r.region"
                  >
                    {{ fmtNum(r.votosEnvJeeEst) }}
                  </span>
                  <span v-else>{{ fmtNum(r.votosEnvJeeEst) }}</span>
                </td>
                <td class="px-3 py-3 text-right text-gray-700 border-r-2 border-gray-300">
                  <span
                    v-if="isTop3Pendiente(r.region)"
                    class="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800"
                    :title="'Top 3 mayor bolson de votos por contar: ' + r.region"
                  >
                    {{ fmtNum(r.votosPendientesEstimados) }}
                  </span>
                  <span v-else>{{ fmtNum(r.votosPendientesEstimados) }}</span>
                </td>
                <td class="px-3 py-3 text-right font-semibold text-emerald-700">
                  <div>{{ fmtNum(r.extraRoberto) }}<span v-if="r.extraRoberto === maxExtraRoberto" class="ml-1 text-emerald-600">*</span></div>
                  <div class="text-[10px] font-normal text-gray-500">{{ fmtPct(r.pctRoberto) }}</div>
                  <div class="text-[10px] font-normal text-gray-400">
                    <span class="text-amber-600">JEE {{ fmtNum(r.votosEnvJeeEst * (r.pctRoberto/100)) }}</span>
                    <span class="text-gray-300"> | </span>
                    <span class="text-sky-600">Pend {{ fmtNum(r.votosPendientesEstimados * (r.pctRoberto/100)) }}</span>
                  </div>
                </td>
                <td class="px-3 py-3 text-right font-semibold text-orange-500 border-r-2 border-gray-300">
                  <div>{{ fmtNum(r.extraKeiko) }}<span v-if="r.extraKeiko === maxExtraKeiko" class="ml-1 text-orange-600">*</span></div>
                  <div class="text-[10px] font-normal text-gray-500">{{ fmtPct(r.pctKeiko) }}</div>
                  <div class="text-[10px] font-normal text-gray-400">
                    <span class="text-amber-600">JEE {{ fmtNum(r.votosEnvJeeEst * (r.pctKeiko/100)) }}</span>
                    <span class="text-gray-300"> | </span>
                    <span class="text-sky-600">Pend {{ fmtNum(r.votosPendientesEstimados * (r.pctKeiko/100)) }}</span>
                  </div>
                </td>
                <td
                  class="px-3 py-3 text-right font-semibold"
                  :class="r.diferenciaNeta >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                >
                  {{ fmtNum(Math.abs(r.diferenciaNeta)) }}
                  <span class="ml-1 text-[10px] font-normal">{{ r.diferenciaNeta >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                </td>
              </tr>
              <tr class="bg-gray-100 font-semibold text-gray-900">
                <td class="px-3 py-3 border-r-2 border-gray-300">TOTAL</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(totalActasContabilizadas + totalActasEnviadasJee + totalActasPendientesJee) }}</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(totalActasContabilizadas) }}</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(totalActasEnviadasJee) }}</td>
                <td class="px-3 py-3 text-right text-gray-700 border-r-2 border-gray-300">{{ fmtNum(totalActasPendientesJee) }}</td>
                <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(totalVotosEnvJeeEst) }}</td>
                <td class="px-3 py-3 text-right text-gray-700 border-r-2 border-gray-300">{{ fmtNum(totalVotosPendientes - totalVotosEnvJeeEst) }}</td>
                <td class="px-3 py-3 text-right font-bold text-emerald-800">
                  <div>{{ fmtNum(totalExtraRoberto) }}</div>
                  <div class="text-[10px] font-normal text-gray-400">
                    <span class="text-amber-600">JEE {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosEnvJeeEst * (r.pctRoberto/100), 0)) }}</span>
                    <span class="text-gray-300"> | </span>
                    <span class="text-sky-600">Pend {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosPendientesEstimados * (r.pctRoberto/100), 0)) }}</span>
                  </div>
                </td>
                <td class="px-3 py-3 text-right font-bold text-rose-700 border-r-2 border-gray-300">
                  <div>{{ fmtNum(totalExtraKeiko) }}</div>
                  <div class="text-[10px] font-normal text-gray-400">
                    <span class="text-amber-600">JEE {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosEnvJeeEst * (r.pctKeiko/100), 0)) }}</span>
                    <span class="text-gray-300"> | </span>
                    <span class="text-sky-600">Pend {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosPendientesEstimados * (r.pctKeiko/100), 0)) }}</span>
                  </div>
                </td>
                <td
                  class="px-3 py-3 text-right font-semibold"
                  :class="ventajaFinal >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                >
                  {{ fmtNum(Math.abs(ventajaFinal)) }}
                  <span class="ml-1 text-[10px] font-normal">{{ ventajaFinal >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <!-- TAB 1: Conteo -->
        <div v-if="activeTab === 'conteo'">
          <h2 class="mb-4 text-lg font-bold text-gray-800">Conteo de votos por region</h2>
          <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100 text-left text-xs font-semibold uppercase text-gray-600">
                <tr>
                  <th class="px-3 py-3 border-r-2 border-gray-300">Region</th>
                  <th class="px-3 py-3 text-right">Actas cont.</th>
                  <th class="px-3 py-3 text-right">Votos emitidos</th>
                  <th class="px-3 py-3 text-right">Votos validos</th>
                  <th class="px-3 py-3 text-right">Blanco / Nulos</th>
                  <th class="px-3 py-3 text-right text-emerald-700">Roberto</th>
                  <th class="px-3 py-3 text-right text-rose-700">Keiko</th>
                  <th class="px-3 py-3 text-right">Ventaja</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="r in resultados"
                  :key="'cnt-' + r.region"
                  class="hover:bg-gray-50"
                >
                  <td class="px-3 py-3 font-medium text-gray-900 border-r-2 border-gray-300">{{ r.region }}</td>
                  <td class="px-3 py-3 text-right text-gray-700">{{ r.contabilizadas }}</td>
                  <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(r.votosEmitidos) }}</td>
                  <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(r.votosValidos) }}</td>
                  <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(r.votosBlancoNulos) }}</td>
                  <td class="px-3 py-3 text-right font-semibold text-emerald-700">{{ fmtNum(r.votosRoberto) }}</td>
                  <td class="px-3 py-3 text-right font-semibold text-rose-700">{{ fmtNum(r.votosKeiko) }}</td>
                  <td
                    class="px-3 py-3 text-right font-semibold"
                    :class="r.votosRoberto - r.votosKeiko >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                  >
                    {{ fmtNum(Math.abs(r.votosRoberto - r.votosKeiko)) }}
                    <span class="ml-1 text-[10px] font-normal">{{ r.votosRoberto - r.votosKeiko >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 font-semibold text-gray-900">
                  <td class="px-3 py-3 border-r-2 border-gray-300">TOTAL</td>
                  <td class="px-3 py-3 text-right">{{ fmtNum(totalActasContabilizadas) }}</td>
                  <td class="px-3 py-3 text-right">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosEmitidos, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosValidos, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosBlancoNulos, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right text-emerald-800">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right text-rose-800">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosKeiko, 0)) }}
                  </td>
                  <td
                    class="px-3 py-3 text-right font-semibold"
                    :class="resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto - r.votosKeiko, 0) >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                  >
                    {{ fmtNum(Math.abs(resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto - r.votosKeiko, 0))) }}
                    <span class="ml-1 text-[10px] font-normal">{{ resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto - r.votosKeiko, 0) >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 3: Total proyectado -->
        <div v-if="activeTab === 'total'">
          <h2 class="mb-1 text-lg font-bold text-gray-800">Total votacion al momento + votos proyectados</h2>
          <p class="mb-4 text-xs text-gray-500">
            El total proyectado suma los votos ya contabilizados mas los estimados de actas pendientes.
            Los numeros proyectados dependen de que el JEE valide las actas.
          </p>
          <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100 text-left text-xs font-semibold uppercase text-gray-600">
                <tr>
                  <th class="px-3 py-3 border-r-2 border-gray-300">Region</th>
                  <th class="px-3 py-3 text-right border-r-2 border-gray-300">Roberto cont.</th>
                  <th class="px-3 py-3 text-right">Extra Roberto</th>
                  <th class="px-3 py-3 text-right border-r-2 border-gray-300">Total Roberto</th>
                  <th class="px-3 py-3 text-right">Keiko cont.</th>
                  <th class="px-3 py-3 text-right">Extra Keiko</th>
                  <th class="px-3 py-3 text-right border-r-2 border-gray-300">Total Keiko</th>
                  <th class="px-3 py-3 text-right border-r-2 border-gray-300">Ventaja actual</th>
                  <th class="px-3 py-3 text-right">Ventaja total proyectada</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="r in resultados"
                  :key="'tot-' + r.region"
                  class="hover:bg-gray-50"
                >
                  <td class="px-3 py-3 font-medium text-gray-900 border-r-2 border-gray-300">{{ r.region }}</td>
                  <td class="px-3 py-3 text-right text-gray-700 border-r-2 border-gray-300">{{ fmtNum(r.votosRoberto) }}</td>
                  <td class="px-3 py-3 text-right text-gray-500 text-[11px]">{{ fmtNum(r.extraRoberto) }}</td>
                  <td class="px-3 py-3 text-right font-semibold text-emerald-700 border-r-2 border-gray-300">{{ fmtNum(r.votosRoberto + r.extraRoberto) }}</td>
                  <td class="px-3 py-3 text-right text-gray-700">{{ fmtNum(r.votosKeiko) }}</td>
                  <td class="px-3 py-3 text-right text-gray-500 text-[11px]">{{ fmtNum(r.extraKeiko) }}</td>
                  <td class="px-3 py-3 text-right font-semibold text-rose-700 border-r-2 border-gray-300">{{ fmtNum(r.votosKeiko + r.extraKeiko) }}</td>
                  <td
                    class="px-3 py-3 text-right font-semibold border-r-2 border-gray-300"
                    :class="r.votosRoberto - r.votosKeiko >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                  >
                    {{ fmtNum(Math.abs(r.votosRoberto - r.votosKeiko)) }}
                    <span class="ml-1 text-[10px] font-normal">{{ r.votosRoberto - r.votosKeiko >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                  </td>
                  <td
                    class="px-3 py-3 text-right font-semibold"
                    :class="(r.votosRoberto + r.extraRoberto) - (r.votosKeiko + r.extraKeiko) >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                  >
                    {{ fmtNum(Math.abs((r.votosRoberto + r.extraRoberto) - (r.votosKeiko + r.extraKeiko))) }}
                    <span class="ml-1 text-[10px] font-normal">{{ (r.votosRoberto + r.extraRoberto) - (r.votosKeiko + r.extraKeiko) >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 font-semibold text-gray-900">
                  <td class="px-3 py-3 border-r-2 border-gray-300">TOTAL</td>
                  <td class="px-3 py-3 text-right border-r-2 border-gray-300">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right text-gray-500 text-[11px]">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.extraRoberto, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right text-emerald-800 border-r-2 border-gray-300">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto + r.extraRoberto, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosKeiko, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right text-gray-500 text-[11px]">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.extraKeiko, 0)) }}
                  </td>
                  <td class="px-3 py-3 text-right text-rose-800 border-r-2 border-gray-300">
                    {{ fmtNum(resultados.reduce((s: number, r: RegionResult) => s + r.votosKeiko + r.extraKeiko, 0)) }}
                  </td>
                  <td
                    class="px-3 py-3 text-right font-semibold border-r-2 border-gray-300"
                    :class="resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto - r.votosKeiko, 0) >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                  >
                    {{ fmtNum(Math.abs(resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto - r.votosKeiko, 0))) }}
                    <span class="ml-1 text-[10px] font-normal">{{ resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto - r.votosKeiko, 0) >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                  </td>
                  <td
                    class="px-3 py-3 text-right font-semibold"
                    :class="resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto + r.extraRoberto - r.votosKeiko - r.extraKeiko, 0) >= 0 ? 'text-emerald-700' : 'text-orange-500'"
                  >
                    {{ fmtNum(Math.abs(resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto + r.extraRoberto - r.votosKeiko - r.extraKeiko, 0))) }}
                    <span class="ml-1 text-[10px] font-normal">{{ resultados.reduce((s: number, r: RegionResult) => s + r.votosRoberto + r.extraRoberto - r.votosKeiko - r.extraKeiko, 0) >= 0 ? 'Roberto +' : 'Keiko +' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
