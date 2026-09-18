<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', val: string): void }>()
</script>

<template>
  <div class="px-5 py-3 border-b border-[#2e2820] bg-[#141210]"
    style="background: var(--bg-topbar); border-color: var(--border-color)">
    <UInput
      :model-value="modelValue"
      placeholder="Search menu..."
      icon="i-heroicons-magnifying-glass"
      class="w-full"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>