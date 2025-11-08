<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold">Cadastrar</h2>
        <p class="mt-2 text-sm mb-8">Crie sua conta no Collabus</p>
      </div>
      <UForm :state="state" @submit.prevent="handleSignUp">
        <div class="mb-4">
          <UFormField label="Nome">
            <InputTextLarge
              id="name"
              v-model="state.name"
              placeholder="Seu nome completo"
              icon="mdi:card-account-details-outline"
              :required="true"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField label="E-mail">
            <InputTextLarge
              id="email"
              v-model="state.email"
              placeholder="seu@email.com"
              icon="mdi:at"
              :required="true"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField label="Senha">
            <InputPasswordLarge
              id="password"
              v-model="state.password"
              :type="state.showPassword ? 'text' : 'password'"
              placeholder="Crie uma senha"
              icon="mdi:lock-outline"
              :trailing-icon="
                state.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'
              "
              @trailing-click="state.showPassword = !state.showPassword"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Confirmar Senha">
            <InputPasswordLarge
              id="password-confirm"
              v-model="state.passwordConfirm"
              :type="state.showPasswordConfirm ? 'text' : 'password'"
              placeholder="Repita a senha"
              icon="mdi:lock-check-outline"
              :trailing-icon="
                state.showPasswordConfirm
                  ? 'mdi:eye-outline'
                  : 'mdi:eye-off-outline'
              "
              @trailing-click="
                state.showPasswordConfirm = !state.showPasswordConfirm
              "
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <ButtonLarge 
              label="cadastrar" 
              variant="solid" 
              type="submit"
              :loading="state.loading"
              :disabled="state.loading"
            >
              Cadastrar
              <UIcon name="mdi:account-plus" size="xl" />
            </ButtonLarge>
          </UFormField>
        </div>
        <div class="mb-4 text-center">
          <p class="text-sm">
            Já tem conta?
            <NuxtLink
              to="/sign-in"
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
import { reactive } from "vue";

const router = useRouter();
const toast = useToast();
const { signUp } = useAuth();

const state = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  showPassword: false,
  showPasswordConfirm: false,
  loading: false,
});

const handleSignUp = async () => {
  // Prevenir múltiplas submissões
  if (state.loading) return;
  
  state.loading = true;
  
  try {
    if (
      !state.name ||
      !state.email ||
      !state.password ||
      !state.passwordConfirm
    ) {
      toast.add({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        color: "error",
      });
      return;
    }

    if (state.password !== state.passwordConfirm) {
      toast.add({
        title: "Erro",
        description: "As senhas não coincidem",
        color: "error",
      });
      return;
    }

    await signUp({
      name: state.name,
      email: state.email,
      password: state.password,
      passwordConfirm: state.passwordConfirm,
    });

    toast.add({
      title: "Sucesso!",
      description: "Conta criada! Verifique seu e-mail para ativar a conta.",
      color: "success",
    });

    await router.push("/sign-in");
  } catch (error) {
    const err = error as Error;
    console.log("Error during sign-up", err);
    toast.add({
      title: "Erro",
      description: "Erro ao criar conta",
      color: "error",
    });
  } finally {
    state.loading = false;
  }
};
</script>
