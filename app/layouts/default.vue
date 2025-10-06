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
            <div class="relative" ref="userWrapper">
              <div @click="toggleUserMenu" class="cursor-pointer">
                <UUser
                  :name="userInfo.firstName"
                  :avatar="{
                    src: 'https://i.pravatar.cc/150?img=13',
                    icon: 'i-lucide-image'
                  }"
                />
              </div>

              <transition name="fade">
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded shadow-lg z-50 py-1"
                >
                  <div class="p-2">
                    <UButton size="sm" color="error" class="w-full" @click="handleSignOut">
                      Sair
                    </UButton>
                  </div>
                </div>
              </transition>
            </div>
          </template>
        </div>
      </template>
    </UDashboardNavbar>

    <slot />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from "vue-router";

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

const showUserMenu = ref(false);
const userWrapper = ref<HTMLElement | null>(null);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node;
  if (!userWrapper.value) return;
  if (!userWrapper.value.contains(target)) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
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
      showUserMenu.value = false;
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

</script>
