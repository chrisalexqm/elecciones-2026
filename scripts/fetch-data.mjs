import { writeFileSync } from 'fs'
import { join } from 'path'

const BASE = 'https://resultadosegundavuelta.onpe.gob.pe/presentacion-backend'
const PARAMS = 'idEleccion=10&tipoFiltro=ubigeo_nivel_01&idAmbitoGeografico=1'

const departamentos = [
  { ubigeo: '010000', nombre: 'AMAZONAS' },
  { ubigeo: '020000', nombre: 'ÁNCASH' },
  { ubigeo: '030000', nombre: 'APURÍMAC' },
  { ubigeo: '040000', nombre: 'AREQUIPA' },
  { ubigeo: '050000', nombre: 'AYACUCHO' },
  { ubigeo: '060000', nombre: 'CAJAMARCA' },
  { ubigeo: '240000', nombre: 'CALLAO' },
  { ubigeo: '070000', nombre: 'CUSCO' },
  { ubigeo: '080000', nombre: 'HUANCAVELICA' },
  { ubigeo: '090000', nombre: 'HUÁNUCO' },
  { ubigeo: '100000', nombre: 'ICA' },
  { ubigeo: '110000', nombre: 'JUNÍN' },
  { ubigeo: '120000', nombre: 'LA LIBERTAD' },
  { ubigeo: '130000', nombre: 'LAMBAYEQUE' },
  { ubigeo: '140000', nombre: 'LIMA' },
  { ubigeo: '150000', nombre: 'LORETO' },
  { ubigeo: '160000', nombre: 'MADRE DE DIOS' },
  { ubigeo: '170000', nombre: 'MOQUEGUA' },
  { ubigeo: '180000', nombre: 'PASCO' },
  { ubigeo: '190000', nombre: 'PIURA' },
  { ubigeo: '200000', nombre: 'PUNO' },
  { ubigeo: '210000', nombre: 'SAN MARTÍN' },
  { ubigeo: '220000', nombre: 'TACNA' },
  { ubigeo: '230000', nombre: 'TUMBES' },
  { ubigeo: '250000', nombre: 'UCAYALI' },
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://resultadosegundavuelta.onpe.gob.pe/',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(url, label, retries = 5, delay = 2000) {
  let lastError
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS })
      const text = await res.text()
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // ONPE sometimes returns HTML error pages instead of JSON
      if (text.trim().startsWith('<')) throw new Error('HTML response instead of JSON')
      const json = JSON.parse(text)
      return json.data
    } catch (e) {
      lastError = e
      if (i < retries - 1) {
        const wait = delay * Math.pow(2, i)
        console.log(`  Retry ${i + 1}/${retries} for ${label} in ${wait}ms...`)
        await sleep(wait)
      }
    }
  }
  throw new Error(`${label}: ${lastError?.message} (intentos: ${retries})`)
}

async function fetchTotales(ubigeo) {
  const url = `${BASE}/resumen-general/totales?${PARAMS}&idUbigeoDepartamento=${ubigeo}`
  return fetchWithRetry(url, `Totales ${ubigeo}`)
}

async function fetchParticipantes(ubigeo) {
  const url = `${BASE}/resumen-general/participantes?${PARAMS}&idUbigeoDepartamento=${ubigeo}`
  return fetchWithRetry(url, `Participantes ${ubigeo}`)
}

async function main() {
  const list = []
  const rawList = []
  let idx = 0

  for (const dep of departamentos) {
    idx++
    console.log(`[${idx}/25] ${dep.nombre}`)
    if (idx > 1) {
      await sleep(1500)
    }
    const [totales, participantes] = await Promise.all([
      fetchTotales(dep.ubigeo),
      fetchParticipantes(dep.ubigeo),
    ])

    const votosPorActa = totales.contabilizadas > 0 ? totales.totalVotosValidos / totales.contabilizadas : 0
    const votosEnvJeeEst = (totales.enviadasJee ?? 0) * votosPorActa
    const votosPendientesEstimados = (totales.pendientesJee ?? 0) * votosPorActa
    const votosPendientesTotal = votosEnvJeeEst + votosPendientesEstimados

    const roberto = participantes.find((p) => p.nombreCandidato.includes('SANCHEZ'))
    const keiko = participantes.find((p) => p.nombreCandidato.includes('FUJIMORI'))

    const pctRoberto = roberto ? roberto.porcentajeVotosValidos : 0
    const pctKeiko = keiko ? keiko.porcentajeVotosValidos : 0

    const extraRobertoEnvJee = votosEnvJeeEst * (pctRoberto / 100)
    const extraRobertoPend = votosPendientesEstimados * (pctRoberto / 100)
    const extraKeikoEnvJee = votosEnvJeeEst * (pctKeiko / 100)
    const extraKeikoPend = votosPendientesEstimados * (pctKeiko / 100)
    const extraRoberto = extraRobertoEnvJee + extraRobertoPend
    const extraKeiko = extraKeikoEnvJee + extraKeikoPend

    const votosRoberto = roberto ? roberto.totalVotosValidos : 0
    const votosKeiko = keiko ? keiko.totalVotosValidos : 0

    list.push({
      region: dep.nombre,
      totalActas: totales.totalActas,
      contabilizadas: totales.contabilizadas,
      enviadasJee: totales.enviadasJee,
      pendientesJee: totales.pendientesJee,
      actasPendientes: totales.pendientesJee ?? 0,
      diferenciaContJee: totales.contabilizadas - totales.enviadasJee,
      actasContabilizadasPct: totales.actasContabilizadas,
      votosEnvJeeEst,
      votosPendientesEstimados,
      votosEmitidos: totales.totalVotosEmitidos,
      votosValidos: totales.totalVotosValidos,
      votosBlancoNulos: totales.totalVotosEmitidos - totales.totalVotosValidos,
      votosRoberto,
      votosKeiko,
      pctRoberto,
      pctKeiko,
      extraRoberto,
      extraKeiko,
      extraRobertoEnvJee,
      extraRobertoPend,
      extraKeikoEnvJee,
      extraKeikoPend,
      diferenciaNeta: extraRoberto - extraKeiko,
    })
    rawList.push(totales)
  }

  const output = {
    timestamp: new Date().toISOString(),
    resultados: list,
    totalesRaw: rawList,
  }

  const outPath = join(process.cwd(), 'public', 'data.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`Guardado: ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
