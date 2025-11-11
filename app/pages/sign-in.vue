<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold">Entrar</h2>
        <p class="mt-2 text-sm mb-8">Entre na sua conta do Collabus</p>
      </div>
      <UForm :state="state" @submit.prevent="handleSignIn">
        <div class="mb-4">
          <UFormField label="E-mail" name="email">
            <InputTextLarge
              id="email"
              v-model="state.email"
              icon="mdi:at"
              :required="true"
              placeholder="seu@email.com"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Senha" name="senha">
            <InputPasswordLarge
              id="password"
              v-model="state.password"
              :type="state.showPassword ? 'text' : 'password'"
              icon="mdi:lock-outline"
              placeholder="Digite sua senha"
              :required="true"
              :trailing-icon="
                state.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'
              "
              @trailing-click="state.showPassword = !state.showPassword"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <ButtonLarge 
              label="login" 
              variant="solid" 
              type="submit"
              :loading="state.loading"
              :disabled="state.loading"
            >
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

const router = useRouter();
const toast = useToast();
const { signIn } = useAuth();
const { fetch } = useUserSession();
const authStore = useAuthStore();

const state = reactive({
  email: "",
  password: "",
  showPassword: false,
  loading: false,
});

const handleSignIn = async () => {
  // Prevenir múltiplas submissões
  if (state.loading) return;
  
  state.loading = true;
  
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

    // attempt to fetch session; if it fails, continue but log the error
    try {
      await fetch();
      console.log('Session fetch succeeded');
    } catch (fetchErr) {
      console.warn('Session fetch failed (non-blocking):', fetchErr);
    }

    authStore.setUser({
      user: response.user,
      token: response.token.accessToken,
      tokenType: "accessToken",
    });

    // resilient navigation with logging and fallbacks
    try {
      await router.push({ path: "/home" });
      console.log('Navigation to /home succeeded via router.push');
    } catch (navErr) {
      console.error('Navigation failed via router.push', navErr);
      try {
        // @ts-ignore
        if (typeof navigateTo === 'function') {
          await navigateTo('/home');
          console.log('Navigation to /home succeeded via navigateTo');
        } else {
          window.location.href = '/home';
        }
      } catch (finalErr) {
        console.error('All navigation attempts failed, falling back to window.location', finalErr);
        window.location.href = '/home';
      }
    }
  } catch (error) {
    const err = error as Error;
    console.log("Error during sign-in", err);
    toast.add({
      title: "Erro",
      description: "Usuário ou senha inválidos.",
      color: "error",
    });
    return;
  } finally {
    state.loading = false;
  }
};
</script>
