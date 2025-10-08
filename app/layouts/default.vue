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
          @click="navigateTo('/home')"
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
            <UserMenu :name="userInfo.firstName" @signout="handleSignOut" />
          </template>
        </div>
      </template>
    </UDashboardNavbar>

    <div class="pb-20"> <!-- espaço para a bottom nav -->
      <slot />
    </div>

    <template v-if="loggedIn">
      <nav class="fixed bottom-0 left-0 right-0 border-t z-50">
        <div class="max-w-5xl mx-auto px-4">
          <div class="flex justify-between items-center py-3">
            <button class="flex-1 text-center p-2" @click="navigateTo('/')">
              <div class="inline-flex flex-col items-center text-sm">
                <UIcon name="mdi:home" :size="20" />
                <span>Inicial</span>
              </div>
            </button>
            <button class="flex-1 text-center p-2" @click="navigateTo('/')">
              <div class="inline-flex flex-col items-center text-sm">
                <UIcon name="mdi:account-group" :size="20" />
                <span>Lorem Ipsum</span>
              </div>
            </button>
            <button class="flex-1 text-center p-2" @click="navigateTo('/profile')">
              <div class="inline-flex flex-col items-center text-sm">
                <UIcon name="mdi:account" :size="20" />
                <span>Perfil</span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from "vue-router";
import UserMenu from '@/components/UserMenu.vue';

const { loggedIn, fetch: fetchSession } = useUserSession();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
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
    console.error(error);
    toast.add({
      title: "Erro ao sair",
      description: "Ocorreu um erro ao tentar fazer logout",
    });
  }
};

// watches for changes in loggedIn state
watch(
  () => loggedIn.value,
  (newValue) => {
    if (newValue) {
      // ensure user menu is closed when login state changes (avoid it being open immediately after sign-in)
      // try to refresh session-based store if it's empty
  if (!user.value?.id) {
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
  () => user.value?.id,
  (newId) => {
    if (newId) {
      loadPersonDetails();
    }
  }
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

const navigateTo = (path: string) => router.push(path);

onMounted(() => {
  // disable page scrolling while this layout is active
  try {
    document.body.style.overflow = 'hidden';
  } catch (e) {
    // ignore in SSR or restricted environments
  }
});

onUnmounted(() => {
  try {
    document.body.style.overflow = '';
  } catch (e) {}
});
</script>
