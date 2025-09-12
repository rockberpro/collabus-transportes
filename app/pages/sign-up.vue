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
const logger = useLogger();

const state = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  showPassword: false,
  showPasswordAgain: false,
});

const handleSignUp = async () => {
  const startTime = Date.now();
  
  try {
    logger.userAction("Sign-up attempt started", {
      email: state.email,
      hasName: !!state.name
    });

    if (
      !state.name ||
      !state.email ||
      !state.password ||
      !state.passwordConfirm
    ) {
      logger.validationError("required_fields", "Missing required fields", {
        hasName: !!state.name,
        hasEmail: !!state.email,
        hasPassword: !!state.password,
        hasPasswordConfirm: !!state.passwordConfirm
      });

      toast.add({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        color: "error",
      });
      return;
    }

    if (state.password !== state.passwordConfirm) {
      logger.validationError("password_confirmation", "Passwords don't match", {
        email: state.email
      });

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

    const duration = Date.now() - startTime;
    logger.userAction("Sign-up completed successfully", {
      email: state.email,
      userId: response?.user?.id,
      duration: `${duration}ms`
    });

    toast.add({
      title: "Sucesso!",
      description: "Conta criada! Verifique seu e-mail para ativar a conta.",
      color: "success",
    });

    await router.push("/sign-in");
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.apiError("/api/users/sign-up", error, {
      email: state.email,
      duration: `${duration}ms`,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    });

    toast.add({
      title: "Erro",
      description: error.data?.message || "Erro ao criar conta",
      color: "error",
    });
  }
};
</script>
