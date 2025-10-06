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
const { loggedIn, fetch: fetchSession } = useUserSession();
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
      // try to refresh session-based store if it's empty
      if (!user?.id) {
        // fetch session (populates nuxt-auth-utils session cookie/store)
        // and then attempt to load user/person details
        fetchSession().then(() => {
          loadUserDetails();
          loadPersonDetails();
        }).catch(() => {
          // ignore fetch errors; we'll handle missing user below
        });
      } else {
        loadUserDetails();
        loadPersonDetails();
      }
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
    if (!user?.id) return;

    const userDetails = await getUserById(user.id);
    if (userDetails) {
      // optionally update store or local info if needed
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do usuário:", error);
  }
};

const loadPersonDetails = async () => {
  if (!user?.id) {
    // If there's no user id, don't attempt to load person details.
    // This can happen while session/user store is being populated.
    // No need to log an error here; simply skip until the id becomes available.
    return;
  }

  try {
    const personDetails = await getPersonByUserId(user.id);
    if (personDetails) {
      userInfo.name = personDetails.data.firstName + " " + personDetails.data.lastName;
      userInfo.firstName = personDetails.data.firstName;
      userInfo.lastName = personDetails.data.lastName;
      userInfo.createdAt = new Date(personDetails.data.createdAt);
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
