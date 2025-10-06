<template>
  <UDashboardPanel>
    <UDashboardNavbar>
      <template #toggle>
        <UIcon name="mdi:menu" :size="20" />
      </template>
      <template #leading>
        <UBadge 
          size="xl" 
          variant="subtle" 
          @click="navigateTo('/')"
          class="cursor-pointer hover:opacity-75 transition-opacity py-4"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <span>Collabus</span>
            </div>
          </template>
        </UBadge>
      </template>
      <template #right>
        <ColorModeButton />
        <div class="px-2">
          <template v-if="loggedIn">
            <UUser
              :name="userInfo.firstName"
              :avatar="{
                src: 'https://i.pravatar.cc/150?img=13',
                icon: 'i-lucide-image'
              }"
            />
          </template>
        </div>
      </template>
    </UDashboardNavbar>

    <slot />
  </UDashboardPanel>
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession();
const { user } = useAuthStore();
const { getUserById } = useUser();
const { getPersonByUserId } = usePerson();

const userInfo = reactive({
  id: "",
  name: "",
  firstName: "",
  email: "",
  role: "",
  createdAt: new Date(),
  token: "",
});

onMounted(async () => {
  await loadUserDetails();
  await loadPersonDetails();
});

const loadUserDetails = async () => {
  try {
    const userDetails = await getUserById(user?.id || "");
    if (userDetails) {
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do usuário:", error);
  }
};

const loadPersonDetails = async () => {
  try {
    const personDetails = await getPersonByUserId(user?.id || "");
    if (personDetails) {
      userInfo.firstName = personDetails.data.firstName;
      userInfo.name = personDetails.data.firstName + " " + personDetails.data.lastName;
      userInfo.createdAt = new Date(personDetails.data.createdAt);
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes da pessoa:", error);
  }
};

</script>
