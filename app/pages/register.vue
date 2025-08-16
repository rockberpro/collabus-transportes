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
            <InputTextLarge
              id="full-name"
              v-model="state.fullName"
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
              placeholder="Crie uma senha"
              icon="mdi:lock-outline"
              :trailing-icon="state.showPassword ? 'mdi:eye' : 'mdi:eye-off'"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField>
            <InputTextLarge
              id="password-again"
              v-model="state.passwordAgain"
              placeholder="Repita a senha"
              type="password"
              icon="mdi:lock-check-outline"
              :trailing-icon="state.showPasswordAgain ? 'mdi:eye' : 'mdi:eye-off'"
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <ButtonLarge
              label="cadastrar"
              variant="solid"
              type="submit"
            >
              Cadastrar
              <UIcon name="mdi:account-plus" size="xl"/>
            </ButtonLarge>
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
import { reactive } from "vue";

definePageMeta({
  auth: false,
  layout: "default",
});

const router = useRouter();
const toast = useToast();
const supabase = useSupabaseClient();

const state = reactive({
  fullName: "",
  email: "",
  password: "",
  passwordAgain: "",
  showPassword: false,
  showPasswordAgain: false,
});

const handleRegister = async () => {
  try {
    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email: state.email,
        password: state.password,
        options: {
          data: {
            fullName: state.fullName,
          },
        },
      }
    );

    if (signupError) {
      console.error("Erro no signup:", signupError);
      alert("Erro ao criar conta: " + signupError.message);
      return;
    }

    if (signupData.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: signupData.user.id,
          fullname: state.fullName,
        },
      ] as any);

      if (profileError) console.error(profileError);

      state.fullName = "";
      state.email = "";
      state.password = "";
      state.passwordAgain = "";

      toast.add({
        title: "Cadastro realizado com sucesso!",
        color: "success",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Erro ao criar conta",
      color: "error",
      description: error?.message || "Erro inesperado ao criar conta",
    });
  }
};
</script>