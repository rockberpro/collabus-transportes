<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <div class="w-full max-w-2xl">
      <h1 class="text-2xl font-semibold mb-4">Sobre mim</h1>

      <UForm @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 mb-4">
          <UFormField label="Nome" name="firstName">
            <InputTextLarge
              id="firstName"
              v-model="person.firstName"
              placeholder="Nome"
            />
          </UFormField>

          <UFormField label="Sobrenome" name="lastName">
            <InputTextLarge
              id="lastName"
              v-model="person.lastName"
              placeholder="Sobrenome"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="CPF" name="cpf">
              <CpfInput
                id="cpf"
                v-model="person.cpf"
                placeholder="000.000.000-00"
              />
            </UFormField>

            <UFormField label="Data de nascimento" name="birthDate">
              <DateMaskedInput
                id="birthDate"
                v-model="birthDateString"
                placeholder="dd/mm/aaaa"
              />
            </UFormField>
          </div>

          <div class="max-w-xs">
            <UFormField label="Telefone" name="phone">
              <PhoneInput
                id="phone"
                v-model="person.phone"
                placeholder="(99) 99999-9999"
              />
            </UFormField>
          </div>

          <UFormField label="Endereço" name="address">
            <InputTextLarge
              id="address"
              v-model="person.address"
              placeholder="Endereço"
            />
          </UFormField>
        </div>

        <div class="py-5">
          <div class="flex justify-end">
            <ButtonLarge type="submit">Salvar</ButtonLarge>
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

const birthDateString = ref(""); // ISO 'YYYY-MM-DD' or empty

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
  } catch (error: any) {
    console.error("Erro ao carregar pessoa:", error);
  }
};

onMounted(load);

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

    toast.add({
      title: "Sucesso",
      description: "Dados salvos com sucesso",
      color: "success",
    });
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
