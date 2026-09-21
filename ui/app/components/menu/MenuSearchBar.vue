<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  modelValue: string
  cartCount?: number
}>()
defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'openNameModal'): void
  (e: 'openMenu'): void
  (e: 'openCart'): void
}>()

const router = useRouter()
</script>

<template>
  <div class="px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 border-b flex items-center gap-2 sm:gap-3"
    style="background: var(--bg-topbar); border-color: var(--border-color)">
    <!-- Mobile menu toggle -->
    <UTooltip text="Open categories">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-bars-3"
        size="sm"
        aria-label="Open categories"
        class="lg:hidden shrink-0"
        @click="$emit('openMenu')"
      />
    </UTooltip>
    <UInput
      :model-value="modelValue"
      placeholder="Search menu..."
      icon="i-heroicons-magnifying-glass"
      class="flex-1 min-w-0"
      size="sm"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <UTooltip text="Manage customers">
        <UButton
          variant="soft"
          color="neutral"
          icon="i-heroicons-user-plus"
          size="sm"
          :aria-label="'Customers'"
          @click="$emit('openNameModal')"
        >
          <span class="hidden sm:inline">Customers</span>
        </UButton>
      </UTooltip>
      <UTooltip text="View orders">
        <UButton
          variant="soft"
          color="primary"
          icon="i-heroicons-document-text"
          size="sm"
          class="hidden sm:inline-flex"
          @click="router.push('/orders')"
        >
          Orders
        </UButton>
      </UTooltip>
      <UTooltip text="View orders" class="sm:hidden">
        <UButton
          variant="soft"
          color="primary"
          icon="i-heroicons-document-text"
          size="sm"
          aria-label="Orders"
          @click="router.push('/orders')"
        />
      </UTooltip>
      <UTooltip text="Open cart" class="lg:hidden">
        <UChip :show="!!(cartCount && cartCount > 0)" :text="cartCount && cartCount > 99 ? '99+' : String(cartCount ?? 0)" color="primary" size="xs" inset>
          <UButton
            variant="soft"
            color="neutral"
            icon="i-heroicons-shopping-bag"
            size="sm"
            aria-label="Open cart"
            @click="$emit('openCart')"
          />
        </UChip>
      </UTooltip>
    </div>
  </div>
</template>