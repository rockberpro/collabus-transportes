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
const { user, updateUserDetails } = useAuthStore();
const { getUserById } = useUser();
const { getPersonByUserId } = usePerson();

const userInfo = reactive({
  id: "",
  name: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  createdAt: new Date(),
  token: "",
});

// watches for changes in loggedIn state
watch(
  () => loggedIn.value,
  (newValue) => {
    if (newValue) {
      loadUserDetails();
      loadPersonDetails();
    }
  }
);

watch(
  () => user?.id,
  (newId) => {
    if (newId) {
      loadPersonDetails();
    }
  }
);

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
  if (!user?.id) {
    console.error("ID do usuário está ausente. Não é possível carregar os detalhes da pessoa.");
    return;
  }

  try {
    const personDetails = await getPersonByUserId(user.id);
    if (personDetails) {
      userInfo.name = personDetails.data.firstName + " " + personDetails.data.lastName;
      userInfo.firstName = personDetails.data.firstName;
      userInfo.lastName = personDetails.data.lastName;
      userInfo.createdAt = new Date(personDetails.data.createdAt);
      console.log("User info:", userInfo);
      updateUserDetails({
        name: userInfo.name,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        createdAt: userInfo.createdAt,
      });
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes da pessoa:", error);
  }
};

</script>
