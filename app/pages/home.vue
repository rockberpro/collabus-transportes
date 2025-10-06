<template>
  <div class="min-h-full p-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bol mb-2">Dashboard</h1>
        <p>Página incial</p>
      </div>

      <!-- Informações do Usuário -->
      <div class="rounded-lg p-6 shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Informações da Conta</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium">Nome</p>
            <p>
              {{ user?.name || "Não disponível" }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              E-mail
            </p>
            <p>
              {{ user?.email || "Não disponível" }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tipo de Conta
            </p>
            <p>
              {{ user?.role }}
            </p>
          </div>
          <div>
            <p>Membro desde</p>
            <p>
              {{ formatDate(user?.createdAt || new Date()) }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2">
        <!-- Logout moved to the user menu in the default layout -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/useAuthStore";
import { storeToRefs } from "pinia";

definePageMeta({
  middleware: ["authenticated"],
  layout: "default",
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
</script>
