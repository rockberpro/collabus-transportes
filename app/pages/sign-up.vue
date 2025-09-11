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
      <UForm @submit.prevent="handleSignUp" :state="state">
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
              placeholder="Crie uma senha"
              icon="mdi:lock-outline"
              :trailing-icon="state.showPassword ? 'mdi:eye' : 'mdi:eye-off'"
            />
          </UFormField>
        </div>
        <div class="mb-12">
          <UFormField label="Confirmar Senha">
            <InputPasswordLarge
              id="password-confirm"
              v-model="state.passwordConfirm"
              placeholder="Repita a senha"
              type="password"
              icon="mdi:lock-check-outline"
              :trailing-icon="
                state.showPasswordAgain ? 'mdi:eye' : 'mdi:eye-off'
              "
            />
          </UFormField>
        </div>
        <div class="mb-4">
          <UFormField>
            <ButtonLarge label="cadastrar" variant="solid" type="submit">
              Cadastrar
              <UIcon name="mdi:account-plus" size="xl" />
            </ButtonLarge>
          </UFormField>
        </div>
        <div class="mb-4 text-center">
          <p class="text-sm text-gray-600">
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
const { signUp } = useUsers();

const state = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  showPassword: false,
  showPasswordAgain: false,
});

const handleSignUp = async () => {
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

    const response = await signUp({
      name: state.name,
      email: state.email,
      password: state.password,
      passwordConfirm: state.passwordConfirm,
    });

    toast.add({
      title: "Sucesso!",
      description: "Conta criada com sucesso",
      color: "success",
    });

    try {
      const emailResponse = await $fetch("/api/send-email", {
        method: "POST",
        body: {
          to: state.email,
          subject: "Bem-vindo ao Collabus Transportes!",
          text: `Olá ${state.name}!\n\nSua conta foi criada com sucesso no Collabus Transportes.\n\nPara ativar sua conta, clique no link abaixo:\n\nObrigado!`,
          html: `
            <h2>Bem-vindo ao Collabus Transportes!</h2>
            <p>Olá <strong>${state.name}</strong>!</p>
            <p>Sua conta foi criada com sucesso.</p>
            <p>Para ativar sua conta, clique no botão abaixo:</p>
            <a href="#" style="background-color: #008080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ativar Conta</a>
            <p/>
          `
        },
      });
      
      toast.add({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para ativar a conta",
        color: "success",
      });
      
    } catch (emailError: any) {
      console.error("Email error:", emailError);
      
      toast.add({
        title: "Aviso",
        description: "Conta criada, mas houve problema no envio do email",
        color: "warning",
      });
    }

    await router.push("/sign-in");
  } catch (error: any) {
    console.error("Erro ao cadastrar:", error);

    toast.add({
      title: "Erro",
      description: error.data?.message || "Erro ao criar conta",
      color: "error",
    });
  }
};
</script>
