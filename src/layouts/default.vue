<template>
  <div>
    <main>
      <RouterView v-slot="{ Component }">
        <transition name="fade-fast" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style>
main {
  background-color: var(--bg);
  min-height: 100vh;
  height: 100%;
}
</style>