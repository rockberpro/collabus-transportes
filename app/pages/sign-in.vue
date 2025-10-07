<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold">Entrar</h2>
        <p class="mt-2 text-sm mb-8">Entre na sua conta do Collabus</p>
      </div>
      <UForm @submit.prevent="handleSignIn" :state="state">
        <div class="mb-4">
          <UFormField label="E-mail" name="email">
            <InputTextLarge
              v-model="state.email"
              id="email"
              icon="mdi:at"
              :required="true"
              placeholder="seu@email.com"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Senha" name="senha">
            <InputPasswordLarge
              v-model="state.password"
              id="password"
              :type="state.showPassword ? 'text' : 'password'"
              icon="mdi:lock-outline"
              :trailing-icon="
                state.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'
              "
              @trailing-click="state.showPassword = !state.showPassword"
              :required="true"
              placeholder="Digite sua senha"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <ButtonLarge label="login" variant="solid" type="submit">
              Entrar
              <UIcon name="mdi:login" />
            </ButtonLarge>
          </UFormField>
        </div>
        <div class="mb-4 text-center">
          <p class="text-sm">
            Não tem conta?
            <NuxtLink
              to="/sign-up"
              class="text-teal-600 hover:text-teal-700 font-medium"
            >
              Cadastre-se
            </NuxtLink>
          </p>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { storeToRefs } from "pinia";

const router = useRouter();
const toast = useToast();
const { signIn } = useAuth();
const { fetch } = useUserSession();
const authStore = useAuthStore();

const state = reactive({
  email: "",
  password: "",
  showPassword: false,
});

const handleSignIn = async () => {
  try {
    if (!state.email || !state.password) {
      toast.add({
        title: "Erro",
        description: "Todos os campos são obrigatórios!",
        color: "error",
      });
      return;
    }

    // handle sign in
    const response = await signIn({
      email: state.email,
      password: state.password,
    });
    await fetch();
    authStore.setUser({
      user: response.user,
      token: response.token.accessToken,
      tokenType: "accessToken",
    });

    await router.push("/home");
  } catch (error: any) {
    toast.add({
      title: "Erro",
      description: error.data?.message || "Erro ao fazer login",
      color: "error",
    });
    return;
  }
};
</script>
