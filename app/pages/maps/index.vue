<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as maptilerSdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const config = useRuntimeConfig();
const mapContainer = ref<HTMLElement | null>(null);
let map: maptilerSdk.Map | null = null;
let navigationControl: maptilerSdk.NavigationControl | null = null;
let geolocateControl: maptilerSdk.GeolocateControl | null = null;

onMounted(() => {
  if (!mapContainer.value) return;

  // Configurar a chave da API do MapTiler
  maptilerSdk.config.apiKey = config.public.MAPTILER_API_KEY as string;

  // Inicializar o mapa
  map = new maptilerSdk.Map({
    container: mapContainer.value,
    style: maptilerSdk.MapStyle.STREETS,
    center: [-51.9653, -29.4685], // Lajeado-RS, Brasil
    zoom: 13,
    language: 'pt',
    navigationControl: false, // Desabilitar controles padrão
    geolocateControl: false, // Desabilitar geolocalização padrão
  });

  // Adicionar controles de navegação (apenas se ainda não existirem)
  if (!navigationControl) {
    navigationControl = new maptilerSdk.NavigationControl();
    map.addControl(navigationControl, 'top-right');
  }
  
  // Adicionar controle de geolocalização (apenas se ainda não existir)
  if (!geolocateControl) {
    geolocateControl = new maptilerSdk.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.addControl(geolocateControl, 'top-right');
  }
});

onUnmounted(() => {
  // Remover controles antes de limpar o mapa
  if (map) {
    if (navigationControl) {
      map.removeControl(navigationControl);
      navigationControl = null;
    }
    if (geolocateControl) {
      map.removeControl(geolocateControl);
      geolocateControl = null;
    }
    map.remove();
    map = null;
  }
});

// Definir metadados da página
definePageMeta({
  middleware: 'authenticated',
  layout: 'map',
});

// Configurar SEO
useHead({
  title: 'Mapa - Collabus Transportes',
  meta: [
    {
      name: 'description',
      content: 'Visualize rotas e veículos no mapa interativo',
    },
  ],
});
</script>

<style scoped>
.map-container {
  position: fixed;
  top: var(--ui-header-height);
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(100vh - var(--ui-header-height) - var(--ui-bottom-nav-height));
}

.map {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

/* Ajustes para modo escuro */
:deep(.maplibregl-ctrl-group) {
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.dark :deep(.maplibregl-ctrl-group) {
  background: rgb(39 39 42); /* zinc-800 */
  border-color: rgb(63 63 70); /* zinc-700 */
}

.dark :deep(.maplibregl-ctrl-group button) {
  background-color: rgb(39 39 42);
  color: white;
}

.dark :deep(.maplibregl-ctrl-group button:hover) {
  background-color: rgb(63 63 70);
}

/* Ajustes para os popups */
:deep(.maplibregl-popup-content) {
  padding: 12px;
  border-radius: 8px;
}

.dark :deep(.maplibregl-popup-content) {
  background-color: rgb(39 39 42);
  color: white;
}

.dark :deep(.maplibregl-popup-tip) {
  border-top-color: rgb(39 39 42);
}

/* Responsividade para dispositivos móveis */
@media (max-width: 640px) {
  :deep(.maplibregl-ctrl-top-right) {
    top: 10px;
    right: 10px;
  }
}
</style>
