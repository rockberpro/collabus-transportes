<template>
  <GoBackButton />
  <div class="flex items-center justify-center min-h-full p-8">
    <div class="w-full max-w-2xl relative">
        <h1 class="text-2xl font-semibold mb-4 flex items-center justify-between">
          <span>Sobre mim</span>
          <ButtonSmall variant="outline" color="secondary" type="button" class="text-gray-500 hover:text-gray-700" @click="editing = !editing" aria-label="Editar">
            <UIcon name="mdi:pencil" />
            <span>Editar</span>
          </ButtonSmall>
        </h1>

        <UForm @submit.prevent="save">
        <!-- Seção de Avatar -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative">
            <!-- Preview circular da imagem -->
            <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <img 
                v-if="avatarBase64" 
                :src="avatarBase64" 
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <UIcon 
                v-else 
                name="i-lucide-user" 
                class="text-4xl text-gray-400"
              />
            </div>
            
            <!-- Botão de upload (apenas quando editando) -->
            <label 
              v-if="editing" 
              class="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors shadow-lg flex items-center justify-center w-10 h-10"
            >
              <UIcon name="i-lucide-camera" class="text-xl" />
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleImageUpload"
              />
            </label>
          </div>
          
          <!-- Botão para remover foto (apenas quando editando e tem foto) -->
          <UButton 
            v-if="editing && avatarBase64" 
            variant="ghost" 
            size="sm" 
            color="error"
            class="mt-2"
            @click="removeAvatar"
          >
            <UIcon name="i-lucide-trash-2" class="mr-1" />
            Remover foto
          </UButton>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-4">
          <UFormField label="Nome" name="firstName">
            <InputTextLarge
              id="firstName"
              v-model="person.firstName"
              placeholder="Nome"
              :disabled="!editing"
            />
          </UFormField>

          <UFormField label="Sobrenome" name="lastName">
            <InputTextLarge
              id="lastName"
              v-model="person.lastName"
              placeholder="Sobrenome"
              :disabled="!editing"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="CPF" name="cpf">
              <CpfInput
                id="cpf"
                v-model="person.cpf"
                placeholder="000.000.000-00"
                :disabled="!editing"
              />
            </UFormField>

            <UFormField label="Data de nascimento" name="birthDate">
              <DateMaskedInput
                id="birthDate"
                v-model="birthDateString"
                placeholder="dd/mm/aaaa"
                :disabled="!editing"
              />
            </UFormField>
          </div>

          <div class="max-w-xs">
            <UFormField label="Telefone" name="phone">
              <PhoneInput
                id="phone"
                v-model="person.phone"
                placeholder="(99) 99999-9999"
                :disabled="!editing"
              />
            </UFormField>
          </div>

          <UFormField label="Endereço" name="address">
            <InputTextLarge
              id="address"
              v-model="person.address"
              placeholder="Endereço"
              :disabled="!editing"
            />
          </UFormField>
        </div>

        <div class="py-5">
          <div class="flex justify-end space-x-2">
            <ButtonLarge type="button" variant="outline" color="neutral" @click="cancel" v-if="editing">Cancelar</ButtonLarge>
            <ButtonLarge type="submit" v-if="editing">Salvar</ButtonLarge>
          </div>
        </div>
      </UForm>

      <!-- Zona de Perigo -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
          Zona de Perigo
        </h2>
        
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">
            Excluir Conta
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão removidos do sistema.
          </p>
          
          <UButton
            v-if="canDeleteAccount"
            color="error"
            variant="solid"
            icon="i-lucide-trash-2"
            @click="confirmDeleteAccount"
          >
            Excluir Minha Conta
          </UButton>
          
          <div v-else class="text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-alert-circle" class="inline mr-1" />
            Sua conta não pode ser excluída pois está vinculada a dados do sistema. Entre em contato com o administrador.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmação de Exclusão -->
  <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click="showDeleteModal = false">
    <UCard class="max-w-md w-full" @click.stop>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
            ⚠️ Excluir Conta Permanentemente
          </h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            @click="showDeleteModal = false"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p class="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
            Esta ação é irreversível!
          </p>
          <ul class="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
            <li>Todos os seus dados serão removidos permanentemente</li>
            <li>Você não poderá recuperar sua conta</li>
            <li>Esta ação não pode ser desfeita</li>
          </ul>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Para confirmar, digite <strong>EXCLUIR</strong> abaixo:
          </label>
          <UInput
            v-model="deleteConfirmText"
            placeholder="Digite EXCLUIR"
            class="w-full"
            @keyup.enter="handleDeleteAccount"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            @click="showDeleteModal = false"
          >
            Cancelar
          </UButton>
          <UButton
            color="error"
            :disabled="deleteConfirmText !== 'EXCLUIR'"
            :loading="deletingAccount"
            @click="handleDeleteAccount"
          >
            Excluir Conta
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import type { CreatePerson, Person } from "~~/types/person";

definePageMeta({
  middleware: ["authenticated"],
  layout: "default",
});

const authStore = useAuthStore();
const { user } = authStore;
const { getPersonByUserId, createPerson, updatePerson } = usePerson();
const { updateUser, deleteUserAccount } = useUser();
const toast = useToast();
const router = useRouter();

const person = reactive<Partial<Person>>({
  id: undefined,
  firstName: "",
  lastName: "",
  cpf: "",
  phone: "",
  address: "",
  birthDate: undefined,
  createdAt: new Date(),
});

const avatarBase64 = ref<string | undefined>(undefined);

const birthDateString = ref(""); // ISO 'YYYY-MM-DD' or empty

const editing = ref(false);
const showDeleteModal = ref(false);
const deleteConfirmText = ref("");
const deletingAccount = ref(false);

const cancel = () => {
  // reload original values and disable editing
  load();
  editing.value = false;
};

const stripNonDigits = (v = "") => (v || "").toString().replace(/\D+/g, "");

const load = async () => {
  if (!user?.id) return;
  try {
    const res = await getPersonByUserId(user.id);
    if (res && res.data) {
      Object.assign(person, res.data);
      birthDateString.value = person.birthDate
        ? new Date(person.birthDate).toISOString().slice(0, 10)
        : "";
    }
    
    // Carregar avatar do usuário
    avatarBase64.value = user.avatarBase64 || undefined;
  } catch (error: any) {
    console.error("Erro ao carregar pessoa:", error);
  }
};

onMounted(load);

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  // Validar tamanho (2MB máximo)
  if (file.size > 2 * 1024 * 1024) {
    toast.add({
      title: "Erro",
      description: "A imagem deve ter no máximo 2MB",
      color: "error",
    });
    return;
  }
  
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: "Erro",
      description: "Apenas imagens são permitidas",
      color: "error",
    });
    return;
  }
  
  // Converter para base64
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarBase64.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeAvatar = () => {
  avatarBase64.value = undefined;
};

const save = async () => {
  try {
    const payload = {
      firstName: person.firstName,
      lastName: person.lastName,
      cpf: stripNonDigits(person.cpf || ""),
      phone: stripNonDigits(person.phone || ""),
      address: person.address,
      birthDate: birthDateString.value
        ? new Date(birthDateString.value)
        : undefined,
    };

    if (person.id) {
      await updatePerson(person.id, payload as CreatePerson);
    } else {
      const created = await createPerson(payload as CreatePerson);
      if (created && created.data) person.id = created.data.id;
    }

    // Atualizar avatar do usuário se mudou
    if (user?.id) {
      await updateUser(user.id, { avatarBase64: avatarBase64.value || null });
    }

    // Atualizar o store com os novos dados, incluindo avatar
    authStore.updateUserDetails({
      firstName: person.firstName,
      lastName: person.lastName,
      avatarBase64: avatarBase64.value || null,
      person: person as Person,
    });

    toast.add({
      title: "Sucesso",
      description: "Dados salvos com sucesso",
      color: "success",
    });
    // disable editing after successful save
    editing.value = false;
  } catch (error) {
    const err = error as Error;
    console.log("Error while saving user profile", err);
    toast.add({
      title: "Erro",
      description: "Erro ao salvar dados",
      color: "error",
    });
  }
};

const canDeleteAccount = computed(() => {
  return user?.role === 'PASSAGEIRO';
});

const confirmDeleteAccount = () => {
  deleteConfirmText.value = "";
  showDeleteModal.value = true;
};

const handleDeleteAccount = async () => {
  if (deleteConfirmText.value !== 'EXCLUIR') {
    return;
  }
  
  deletingAccount.value = true;
  
  try {
    await deleteAccount();
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
  } finally {
    deletingAccount.value = false;
  }
};

const deleteAccount = async () => {
  if (!user?.id) return;
  
  try {
    await deleteUserAccount(user.id);
    
    showDeleteModal.value = false;
    
    toast.add({
      title: "Conta excluída",
      description: "Sua conta foi excluída com sucesso. Você será desconectado.",
      color: "success",
    });
    
    // Aguardar 2 segundos para o usuário ver a mensagem
    setTimeout(async () => {
      authStore.clearUser();
      await router.push('/sign-in');
    }, 2000);
  } catch (error: any) {
    toast.add({
      title: "Erro",
      description: error.data?.message || error.message || "Erro ao excluir conta",
      color: "error",
    });
  }
};
</script>
