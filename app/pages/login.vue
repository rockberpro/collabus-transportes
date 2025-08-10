<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Entrar</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          Entre na sua conta do Collabus
        </p>
      </div>
      <UForm @submit.prevent="handleLogin">
        <div class="mb-4">
          <UFormField label="E-mail">
            <UInput v-model="email" type="text" size="xl" class="w-full" />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Senha">
            <UInput
              v-model="password"
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

<script type="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const router = useRouter()

    const handleLogin = async () => {
      // TODO
      await router.push('/dashboard')
    }

    return {
      email,
      password,
      handleLogin
    }
  }
}
</script>
