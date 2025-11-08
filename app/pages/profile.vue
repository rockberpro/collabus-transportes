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
              class="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors shadow-lg"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import type { CreatePerson, Person } from "~~/types/person";

definePageMeta({
  middleware: ["authenticated"],
  layout: "default",
});

const authStore = useAuthStore();
const { user } = authStore;
const { getPersonByUserId, createPerson, updatePerson } = usePerson();
const { updateUser } = useUser();
const toast = useToast();

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
</script>
