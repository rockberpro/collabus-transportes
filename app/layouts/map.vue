<template>
  <UDashboardPanel>
    <template #header>
      <div class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 pt-[env(safe-area-inset-top)]">
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
      </div>
    </template>

    <template #body>
      <div class="map-layout-body">
        <NuxtPage />
      </div>
    </template>

    <template #footer>
      <div class="pb-[env(safe-area-inset-bottom)]">
        <template v-if="combinedLoggedIn">
          <BottomNav />
        </template>
      </div>
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

watch(
  () => combinedLoggedIn.value,
  (newValue) => {
    if (newValue) {
      if (!user.value?.id) {
        fetchSession()
          .then(() => {
            loadUserDetails();
            loadPersonDetails();
          })
          .catch(() => {});
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
    if (userDetails && userDetails.data) {
      updateUserDetails({
        avatarBase64: userDetails.data.avatarBase64,
      });
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do usuário:", error);
  }
};

const loadPersonDetails = async () => {
  if (!user.value?.id) {
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
        person: personDetails.data,
      });
    }
  } catch (error) {
    console.error("Error while loading user data:", error);
  }
};

const navigateTo = (path: string) => router.push(path);
</script>

<style scoped>
.map-layout-body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
