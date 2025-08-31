<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Entrar</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          Entre na sua conta do Collabus
        </p>
      </div>
      <UForm @submit.prevent="handleSignIn" :state="state">
        <div class="mb-4">
          <UFormField label="E-mail" name="email">
            <InputTextLarge
              v-model="state.email"
              id="email"
              icon="mdi:at"
              :required="true"
              placeholder="Digite seu e-mail"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Senha" name="password">
            <InputPasswordLarge
              :v-model="state.password"
              id="password"
              :type="state.showPassword ? 'text' : 'password'"
              icon="mdi:lock-outline"
              :trailing-icon="state.showPassword ? 'mdi:eye' : 'mdi:eye-off'"
              :required="true"
              placeholder="Digite sua senha"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <ButtonLarge
              label="login"
              variant="solid"
              type="submit"
            >
              Entrar
              <UIcon name="mdi:login" />
            </ButtonLarge>
          </UFormField>
        </div>
        <div class="mb-4 text-center">
          <p class="text-sm text-gray-600">
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

definePageMeta({
  auth: false,
  layout: "default",
});

const router = useRouter();

const state = reactive({
  email: "",
  password: "",
  showPassword: false,
});

const handleSignIn = async () => {
  // TODO
  await router.push("/home");
};
</script>
