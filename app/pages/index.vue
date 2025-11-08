<template>
  <div class="h-screen flex flex-col items-center justify-start pt-32 p-8 overflow-hidden">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">
          Collabus Transportes
        </h1>
        <p>
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

<script setup lang="ts">
// Use server/client route middleware to redirect before render and avoid flicker
definePageMeta({ middleware: ['redirect-if-logged-in'] })
</script>