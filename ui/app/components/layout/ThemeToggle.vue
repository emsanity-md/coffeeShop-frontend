<script setup lang="ts">
/**
 * Theme switch. Lives in components/layout/ rather than components/ui/ because
 * that directory is reserved for shadcn-vue primitives the CLI owns.
 */
import { Moon, Sun } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

const { isDark, toggleTheme } = useTheme()
const label = computed(() => (isDark.value ? 'Switch to light mode' : 'Switch to dark mode'))
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon-sm"
        :aria-label="label"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="size-4" />
        <Moon v-else class="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{{ label }}</TooltipContent>
  </Tooltip>
</template>
