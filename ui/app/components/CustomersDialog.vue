<script setup lang="ts">
/**
 * Add / rename / remove the customers on this order.
 *
 * Duplicate names are rejected rather than silently allowed, because two
 * identical names make the per-customer receipts impossible to tell apart at
 * the table.
 */
import { computed, nextTick, ref, watch } from 'vue'
import { Check, Pencil, Plus, UserPlus, X } from '@lucide/vue'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import type { Customer } from '~/types/menu'

const props = defineProps<{ open: boolean; customers: Customer[] }>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', name: string, editingId: string | null): void
  (e: 'remove', id: string): void
}>()

const nameInput = ref('')
const editingId = ref<string | null>(null)
const duplicate = ref(false)

/**
 * `Input` renders a reka `Primitive` that forwards to a native <input>, but its
 * public instance type doesn't expose `focus`. Reach the element rather than
 * casting the component to `any`.
 */
const inputEl = ref<{ $el?: HTMLInputElement } | null>(null)
function focusInput() {
  nextTick(() => inputEl.value?.$el?.focus?.())
}

const trimmed = computed(() => nameInput.value.trim())
const canSubmit = computed(() => trimmed.value.length > 0 && !duplicate.value)

watch(trimmed, () => { duplicate.value = false })

watch(() => props.open, (open) => {
  if (open) {
    nameInput.value = ''
    editingId.value = null
    duplicate.value = false
    focusInput()
  }
})

function submit() {
  if (!canSubmit.value) {
    // Surface why the button is disabled rather than doing nothing.
    if (trimmed.value) {
      duplicate.value = props.customers.some(
        c => c.name.toLowerCase() === trimmed.value.toLowerCase() && c.id !== editingId.value,
      )
    }
    return
  }
  emit('save', trimmed.value, editingId.value)
  nameInput.value = ''
  editingId.value = null
  duplicate.value = false
}

function startEdit(customer: Customer) {
  nameInput.value = customer.name
  editingId.value = customer.id
  duplicate.value = false
  focusInput()
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-section">
          {{ editingId ? 'Edit customer' : 'Add customer' }}
        </DialogTitle>
        <DialogDescription class="text-body">
          Name everyone sharing this bill. The total splits evenly between them.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-3" @submit.prevent="submit">
        <div class="space-y-1.5">
          <Input
            ref="inputEl"
            v-model="nameInput"
            placeholder="e.g. Juan dela Cruz"
            aria-label="Customer name"
            :aria-invalid="duplicate"
            autocomplete="off"
          />
          <p v-if="duplicate" class="text-meta text-destructive">
            That name is already on this order.
          </p>
        </div>

        <div class="flex gap-2">
          <Button type="submit" class="flex-1" :disabled="!canSubmit">
            <Check v-if="editingId" class="size-4" />
            <Plus v-else class="size-4" />
            {{ editingId ? 'Save' : 'Add' }}
          </Button>
          <Button
            v-if="props.customers.length"
            type="button"
            variant="outline"
            class="flex-1"
            @click="emit('update:open', false)"
          >
            Done
          </Button>
        </div>
      </form>

      <template v-if="props.customers.length">
        <Separator />
        <div class="space-y-2">
          <p class="text-label text-muted-foreground">
            On this order · {{ props.customers.length }}
          </p>
          <ul class="max-h-44 space-y-1 overflow-y-auto">
            <li
              v-for="customer in props.customers"
              :key="customer.id"
              class="flex items-center gap-2 rounded-lg px-1 py-0.5"
            >
              <UserPlus class="size-3.5 shrink-0 text-muted-foreground" />
              <span class="min-w-0 flex-1 truncate text-body">{{ customer.name }}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                :aria-label="`Edit ${customer.name}`"
                class="shrink-0"
                @click="startEdit(customer)"
              >
                <Pencil class="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                :aria-label="`Remove ${customer.name}`"
                class="shrink-0 text-muted-foreground hover:text-destructive"
                @click="emit('remove', customer.id)"
              >
                <X class="size-3.5" />
              </Button>
            </li>
          </ul>
        </div>
      </template>

      <DialogFooter v-if="!props.customers.length">
        <Button variant="ghost" @click="emit('update:open', false)">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
