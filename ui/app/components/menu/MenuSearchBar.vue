<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  modelValue: string
}>()
defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'openNameModal'): void
}>()

const router = useRouter()
</script>

<template>
  <div class="px-5 py-3 border-b flex items-center gap-3"
    style="background: var(--bg-topbar); border-color: var(--border-color)">
    <UInput
      :model-value="modelValue"
      placeholder="Search menu..."
      icon="i-heroicons-magnifying-glass"
      class="flex-1"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div class="flex items-center gap-2">
      <UButton
        variant="soft"
        color="neutral"
        icon="i-heroicons-user-plus"
        size="sm"
        @click="$emit('openNameModal')"
      >
        Customers
      </UButton>
      <UButton
        variant="soft"
        color="primary"
        icon="i-heroicons-document-text"
        size="sm"
        @click="router.push('/orders')"
      >
        Orders
      </UButton>
    </div>
  </div>
</template>