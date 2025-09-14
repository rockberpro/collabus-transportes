<template>
  <div class="h-screen flex flex-col items-center justify-start pt-32 p-8 bg-white dark:bg-gray-900 overflow-hidden">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Collabus Transportes
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Bem-vindo ao sistema de transportes
        </p>
      </div>
      
      <div class="space-y-4">
        <ButtonLarge 
          color="primary" 
          @click="navigateTo('/sign-in')"
        >
          Entrar
        </ButtonLarge>
        
        <ButtonLarge 
          color="secondary" 
          variant="outline"
          @click="navigateTo('/sign-up')"
        >
          Cadastrar
        </ButtonLarge>
      </div>
    </div>
  </div>
</template>