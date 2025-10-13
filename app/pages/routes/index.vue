<template>
  <GoBackButton />
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Consultar rotas de ônibus</h1>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium mb-1">Estado</label>
        <select class="w-full p-2 border rounded" disabled>
          <option selected>RS</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Cidade</label>
        <select class="w-full p-2 border rounded" disabled>
          <option selected>Lajeado</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">De onde</label>
        <input list="origins" v-model="filters.origin" class="w-full p-2 border rounded" placeholder="Digite ou escolha uma origem" />
        <datalist id="origins">
          <option value="Estação Rodoviária" />
          <option value="Terminal Central" />
          <option value="Rua das Flores" />
          <option value="Avenida Brasil" />
        </datalist>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Para onde</label>
        <input list="destinations" v-model="filters.destination" class="w-full p-2 border rounded" placeholder="Digite ou escolha um destino" />
        <datalist id="destinations">
          <option value="Estação Rodoviária" />
          <option value="Terminal Central" />
          <option value="Praça Principal" />
          <option value="Hospital Municipal" />
        </datalist>
      </div>
    </div>

    <div class="mb-4">
      <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="search">Pesquisar</button>
      <button class="px-4 py-2 ml-2 border rounded" @click="reset">Limpar</button>
    </div>

    <table class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-3 py-2 text-left">Código</th>
          <th class="border px-3 py-2 text-left">Origem</th>
          <th class="border px-3 py-2 text-left">Destino</th>
          <th class="border px-3 py-2 text-left">Estado</th>
          <th class="border px-3 py-2 text-left">Cidade</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="route in filteredRoutes" :key="route.id">
          <td class="border px-3 py-2">{{ route.code || '-' }}</td>
          <td class="border px-3 py-2">{{ route.origin }}</td>
          <td class="border px-3 py-2">{{ route.destination }}</td>
          <td class="border px-3 py-2">{{ route.state }}</td>
          <td class="border px-3 py-2">{{ route.city }}</td>
        </tr>
        <tr v-if="filteredRoutes.length === 0">
          <td class="border px-3 py-2 text-center" colspan="5">Nenhuma rota encontrada</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const filters = ref({ origin: '', destination: '' })

const routes = ref<Array<any>>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadRoutes() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/routes')
    const json = await res.json()
    routes.value = json.data || []
  } catch (err: any) {
    error.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoutes()
})

const filteredRoutes = computed(() => {
  return routes.value.filter((r: any) => {
    const originMatch = !filters.value.origin || r.origin.toLowerCase().includes(filters.value.origin.toLowerCase())
    const destMatch = !filters.value.destination || r.destination.toLowerCase().includes(filters.value.destination.toLowerCase())
    return originMatch && destMatch
  })
})

function search() { /* busca reativa via computed */ }
function reset() { filters.value.origin = ''; filters.value.destination = '' }
</script>

<style scoped>
/* Pequeno ajuste visual para tabela */
table th, table td { border-color: #e5e7eb; }
</style>
