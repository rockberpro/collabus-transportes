<template>
  <div class="min-h-full bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400">Página incial</p>
      </div>

      <!-- Informações do Usuário -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Informações da Conta
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Nome
            </p>
            <p class="text-gray-900 dark:text-white">
              {{ userInfo.name || "Não disponível" }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              E-mail
            </p>
            <p class="text-gray-900 dark:text-white">
              {{ userInfo.email || "Não disponível" }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tipo de Conta
            </p>
            <p class="text-gray-900 dark:text-white">
              {{ getUserTypeLabel(userInfo.type) }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Membro desde
            </p>
            <p class="text-gray-900 dark:text-white">
              {{ formatDate(userInfo.createdAt) }}
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
import { reactive, onMounted } from "vue";
definePageMeta({
  middleware: ["authenticated"],
});

const userInfo = reactive({
  id: "",
  name: "",
  email: "",
  type: "passenger" as "passenger" | "driver" | "admin",
  createdAt: new Date(),
  token: "",
});

const toast = useToast();
const router = useRouter();
const { signOut } = useAuth();
const { user, clearUser } = useAuthStore();

userInfo.email = user?.email || "";
userInfo.name = "";

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

onMounted(async () => {
  await loadUserData();
});

const loadUserData = async () => {
  // TODO
};

const getUserTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    passenger: "Passageiro",
    driver: "Motorista",
    admin: "Administrador",
  };
  return labels[type] || type;
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
