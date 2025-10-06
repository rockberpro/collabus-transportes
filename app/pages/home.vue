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
        <UButton color="error" type="button" @click="handleSignOut">
          Sair
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/useAuthStore";

definePageMeta({
  middleware: ["authenticated"],
  layout: "default",
});

const { user, clearUser } = useAuthStore();
const toast = useToast();
const router = useRouter();
const { signOut } = useAuth();

const handleSignOut = async () => {
  try {
    await signOut();
    clearUser();
    toast.add({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    await router.push("/sign-in");
  } catch (error) {
    console.log(error);
    toast.add({
      title: "Erro ao sair",
      description: "Ocorreu um erro ao tentar fazer logout",
    });
  }
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
</script>
