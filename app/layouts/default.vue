<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false">
        <template #leading>
          <UBadge
            class="cursor-pointer hover:opacity-75 transition-opacity py-4"
            size="xl"
            variant="subtle"
            @click="navigateTo('/home')"
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
                  <template v-if="combinedLoggedIn">
                    <UserMenu :name="userInfo.firstName" @signout="handleSignOut" />
                  </template>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>

    <template #footer>
      <template v-if="combinedLoggedIn">
        <BottomNav />
      </template>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { computed } from "vue";

const { loggedIn, fetch: fetchSession } = useUserSession();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const combinedLoggedIn = computed(() => Boolean(loggedIn.value) || Boolean(authStore.isAuthenticated));
const { updateUserDetails } = authStore;
const { getUserById } = useUser();
const { getPersonByUserId } = usePerson();
const { signOut } = useAuth();
const router = useRouter();
const toast = useToast();

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

const handleSignOut = async () => {
  try {
    await signOut();
    authStore.clearUser();
    toast.add({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    await router.push("/sign-in");
  } catch (error) {
    const err = error as Error;
    console.log("Error during sign-out", err);
    toast.add({
      title: "Erro ao sair",
      description: "Ocorreu um erro ao tentar fazer logout",
    });
  }
};

// watches for changes in loggedIn state
watch(
  () => combinedLoggedIn.value,
  (newValue) => {
    if (newValue) {
      // ensure user menu is closed when login state changes (avoid it being open immediately after sign-in)
      // try to refresh session-based store if it's empty
      if (!user.value?.id) {
        // fetch session (populates nuxt-auth-utils session cookie/store)
        // and then attempt to load user/person details
        fetchSession()
          .then(() => {
            loadUserDetails();
            loadPersonDetails();
          })
          .catch(() => {
            // ignore fetch errors; we'll handle missing user below
          });
      } else {
        loadUserDetails();
        loadPersonDetails();
      }
    }
  },
);

watch(
  () => user.value?.id,
  (newId) => {
    if (newId) {
      loadPersonDetails();
    }
  },
);

const loadUserDetails = async () => {
  try {
    if (!user.value?.id) return;

    const userDetails = await getUserById(user.value.id);
    if (userDetails) {
      // optionally update store or local info if needed
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do usuário:", error);
  }
};

const loadPersonDetails = async () => {
  if (!user.value?.id) {
    // If there's no user id, don't attempt to load person details.
    // This can happen while session/user store is being populated.
    // No need to log an error here; simply skip until the id becomes available.
    return;
  }

  try {
    const personDetails = await getPersonByUserId(user.value.id);
    if (personDetails) {
      userInfo.name =
        personDetails.data.firstName + " " + personDetails.data.lastName;
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
    console.error("Error while loading user data:", error);
  }
};

const navigateTo = (path: string) => router.push(path);
</script>
