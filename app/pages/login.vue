<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Entrar</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          Entre na sua conta do Collabus
        </p>
      </div>
      <UForm @submit.prevent="handleLogin" :state="state">
        <div class="mb-4">
          <UFormField label="E-mail" name="email">
            <UInput v-model="state.email" type="email" size="xl" class="w-full" />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Senha" name="password">
            <UInput
              v-model="state.password"
              type="password"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <UButton
              label="login"
              size="xl"
              type="submit"
              class="w-full justify-center"
            >
              Entrar
              <UIcon name="i-lucide-log-in" />
            </UButton>
          </UFormField>
        </div>
        <div class="mb-4 text-center">
          <p class="text-sm text-gray-600">
            Não tem conta?
            <NuxtLink
              to="/register"
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
import { reactive } from 'vue'

definePageMeta({
  auth: false,
  layout: 'default'
})

const router = useRouter()

const state = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  // TODO: Implementar lógica de login
  await router.push('/dashboard')
}
</script>
