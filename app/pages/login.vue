<template>
  <div class="flex items-center justify-center min-h-screen h-screen">
    <div>
      <UForm @submit.prevent="handleLogin">
        <div class="mb-4">
          <UFormField label="Usuário">
            <UInput v-model="username" type="text" size="xl" />
          </UFormField>
        </div>
        <div class="mb-8">
          <UFormField label="Senha">
            <UInput v-model="password" type="password" size="xl" />
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
                class="text-primary-600 hover:text-primary-700 font-medium"
              >
                Cadastre-se
              </NuxtLink>
            </p>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script type="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const router = useRouter()

    const handleLogin = async () => {
      // TODO
      await router.push('/dashboard')
    }

    return {
      username,
      password,
      handleLogin
    }
  }
}
</script>
