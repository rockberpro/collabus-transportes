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
      <UForm @submit.prevent="handleRegister" :state="state">
        <div class="mb-4">
          <UFormField label="Nome">
            <UInput
              placeholder="Seu nome completo"
              v-model="state.fullName"
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
              v-model="state.email"
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
              v-model="state.password"
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
              v-model="state.password_again"
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

<script setup lang="ts">
import { reactive } from 'vue'

definePageMeta({
  auth: false,
  layout: 'default'
})

const router = useRouter()
const supabase = useSupabaseClient()

const state = reactive({
  fullName: '',
  email: '',
  password: '',
  password_again: ''
})

const handleRegister = async () => {
  try {
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: state.email,
      password: state.password,
      options: {
        data: {
          fullName: state.fullName
        }
      }
    })

    if (signupError) {
      console.error('Erro no signup:', signupError)
      alert('Erro ao criar conta: ' + signupError.message)
      return
    }

    if (signupData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: signupData.user.id,
          fullname: state.fullName
        }] as any)

      if (profileError) console.error(profileError)

      state.fullName = ''
      state.email = ''
      state.password = ''
      state.password_again = ''

      alert('Cadastro realizado com sucesso!')
      await router.push('/login')
    }
  } catch (error) {
    console.error('Erro no registro:', error)
    alert('Erro inesperado ao criar conta')
  }
}
</script>
