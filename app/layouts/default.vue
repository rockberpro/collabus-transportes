<template>
  <UDashboardPanel class="py-5">
    <UDashboardNavbar>
      <template #toggle>
        <UIcon name="mdi:menu" :size="20" />
      </template>
      <template #leading>
        <UBadge 
          size="xl" 
          variant="subtle" 
          @click="navigateTo('/')"
          class="cursor-pointer hover:opacity-75 transition-opacity"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <img 
                src="~/assets/images/logo.png" 
                alt="Logo" 
                class="h-10 w-auto"
              />
              <span>Collabus</span>
            </div>
          </template>
        </UBadge>
      </template>
      <template #right>
        <ColorModeButton />
      </template>
    </UDashboardNavbar>

    <slot />
  </UDashboardPanel>
</template>
