<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Cadastrar
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          Crie sua conta no Collabus
        </p>
      </div>
      <UForm @submit.prevent="handleRegister">
        <div class="mb-4">
          <UFormField label="Nome">
            <UInput
              placeholder="Seu nome completo"
              v-model="fullName"
              type="text"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField label="E-mail">
            <UInput
              placeholder="seu@email.com"
              v-model="email"
              type="email"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField label="Senha">
            <UInput
              placeholder="Crie uma senha"
              v-model="password"
              type="password"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField>
            <UInput
              placeholder="Repita a senha"
              v-model="password_again"
              type="password"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <UButton
              label="cadastrar"
              size="xl"
              type="submit"
              class="w-full justify-center"
            >
              Cadastrar
              <UIcon name="i-lucide-user-plus" />
            </UButton>
          </UFormField>
        </div>
        <div class="mb-4 text-center">
          <p class="text-sm text-gray-600">
            Já tem conta?
            <NuxtLink
              to="/login"
              class="text-teal-600 hover:text-teal-700 font-medium"
            >
              Faça login
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
    const fullName = ref('')
    const email = ref('')
    const password = ref('')
    const password_again = ref('')
    const router = useRouter()

    const handleRegister = async () => {
      // TODO: Implementar lógica de registro
      await router.push('/login')
    }

    return {
      fullName,
      email,
      password,
      password_again,
      handleRegister
    }
  }
}
</script>
