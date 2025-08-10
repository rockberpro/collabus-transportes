<template>
  <UDashboardPanel>
    <UDashboardNavbar>
      <template #toggle>
        <UIcon name="mdi:menu" :size="20" />
      </template>
      <template #leading>
        <UBadge label="Collabus" size="xl" variant="subtle" />
      </template>
      <template #right>
        <ColorModeButton />
      </template>
    </UDashboardNavbar>

    <UDashboardMainPanel>
      <slot />
    </UDashboardMainPanel>
  </UDashboardPanel>
</template>
