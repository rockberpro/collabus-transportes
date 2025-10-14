<template>
  <GoBackButton />
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Horários por rota</h1>

    <div class="grid grid-cols-1 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium mb-1">Estado</label>
        <select v-model="filters.state" class="w-full p-2 border rounded">
          <option>RS</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Cidade</label>
        <select v-model="filters.city" class="w-full p-2 border rounded">
          <option>Lajeado</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Código da rota</label>
        <input v-model="filters.code" class="w-full p-2 border rounded" placeholder="Ex: R-001" />
      </div>
    </div>

    <div class="mb-4">
      <button class="px-4 py-2 rounded" @click="search">Pesquisar</button>
      <button class="px-4 py-2 ml-2 border rounded" @click="reset">Limpar</button>
    </div>

    <div class="overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0">
      <table class="min-w-[500px] w-full table-auto border-collapse">
        <thead>
          <tr>
            <th class="border px-3 py-2 text-left">Rota</th>
            <th class="border px-3 py-2 text-left">Origem</th>
            <th class="border px-3 py-2 text-left">Destino</th>
            <th class="border px-3 py-2 text-left">Horários</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in schedules" :key="s.id">
            <td class="border px-3 py-2">{{ s.routeCode }}</td>
            <td class="border px-3 py-2">{{ s.route?.origin || '-' }}</td>
            <td class="border px-3 py-2">{{ s.route?.destination || '-' }}</td>
            <td class="border px-3 py-2">{{ formatTimes(s.times) }}</td>
          </tr>
          <tr v-if="schedules.length === 0">
            <td class="border px-3 py-2 text-center" colspan="4">Nenhum horário encontrado</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const filters = ref({ state: 'RS', city: 'Lajeado', code: '' })
const schedules = ref<Array<any>>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadSchedules() {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    if (filters.value.state) params.set('state', filters.value.state)
    if (filters.value.city) params.set('city', filters.value.city)
    if (filters.value.code) params.set('code', filters.value.code)

    const res = await fetch(`/api/schedules?${params.toString()}`)
    const json = await res.json()
    schedules.value = json.data || []
  } catch (err: any) {
    error.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadSchedules())

function search() { loadSchedules() }
function reset() { filters.value.code = '' ; loadSchedules() }

function formatTimes(times: any) {
  if (!times) return '-'
  if (Array.isArray(times)) return times.join(', ')
  try { return JSON.stringify(times) } catch { return String(times) }
}
</script>

<style scoped>
table th, table td { border-color: #e5e7eb; }
</style>
