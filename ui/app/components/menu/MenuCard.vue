<script setup lang="ts">
import { ref } from 'vue'
import type { MenuItem } from '~/types/menu'

const props = defineProps<{ item: MenuItem }>()
const emit = defineEmits<{ (e: 'add', id: number): void }>()

const justAdded = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
const toast = useToast()

function handleAddWithToast(fromButton = false) {
  emit('add', props.item.id)
  justAdded.value = false
  requestAnimationFrame(() => {
    justAdded.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { justAdded.value = false }, 520)
  })
  if (fromButton && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { (navigator as any).vibrate(10) } catch {}
  }
  toast.add({
    title: `${props.item.name} added`,
    description: `₱${props.item.price.toFixed(2)} · tap cart to review`,
    icon: 'i-heroicons-check-circle',
    color: 'success',
  })
}
</script>

<template>
  <div
    class="menu-item anim-press group/menu relative w-full h-44 xs:h-48 sm:h-56 lg:h-60 xl:h-70 rounded-xl overflow-hidden cursor-pointer touch-manipulation"
    :class="{ 'menu-card-added': justAdded }"
    style="background: var(--bg-sidebar)"
    @click="handleAddWithToast()"
  >
    <!-- Image / skeleton -->
    <USkeleton v-if="item.image === ''" class="absolute inset-0 rounded-xl" />
    <img
      v-if="item.image"
      :src="item.image"
      :alt="item.name"
      class="menu-card-img w-full h-full object-cover"
      loading="lazy"
    />
    <span v-else class="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl menu-icon">
      {{ item.icon }}
    </span>

    <!-- Bottom gradient overlay -->
    <div
      class="menu-card-gradient absolute inset-x-0 bottom-0 h-20 sm:h-24 pointer-events-none"
      style="background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 45%, transparent 100%)"
    />

    <!-- Labels -->
    <div class="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 flex items-end justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-xs sm:text-sm font-medium text-white leading-tight truncate">{{ item.name }}</p>
        <p class="text-[11px] sm:text-xs text-white/65 truncate">{{ item.desc }}</p>
      </div>
      <div class="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0">
        <span class="text-[11px] sm:text-xs font-semibold text-white tnum">₱{{ item.price.toFixed(2) }}</span>
        <UChip :show="justAdded" color="success" inset size="xs">
          <UButton
            size="xs"
            class="min-w-7 min-h-7"
            :class="{ 'btn-added': justAdded }"
            :icon="justAdded ? 'i-heroicons-check' : undefined"
            :aria-label="justAdded ? `${item.name} added` : `Add ${item.name}`"
            @click.stop="handleAddWithToast(true)"
          >
            <span v-if="!justAdded">+</span>
          </UButton>
        </UChip>
      </div>
    </div>
  </div>
</template>