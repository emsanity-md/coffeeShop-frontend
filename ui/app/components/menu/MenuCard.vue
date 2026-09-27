<script setup lang="ts">
/**
 * Menu card.
 *
 * The redesign moved the name, description and price OUT of the image and into
 * a text body. The previous version overlaid them on a dark gradient, so
 * legibility depended entirely on whatever photograph happened to be behind
 * them. Here the text always sits on `--card`, which is contrast-checked in
 * both themes regardless of the image.
 *
 * Add feedback is a single spring scale on the card itself. Earlier this was
 * three stacked effects (an expanding ring pulse on the card, a scale pop on
 * the button, and an icon swap) which read as noisy at the speed someone taps
 * through a board. One tween is enough, and the toast plus the cart badge
 * already carry the confirmation.
 */
import { computed, ref } from 'vue'
import { Check, Plus } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { motion, useReducedMotion } from 'motion-v'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { MOTION } from '~/composables/useMotionPreset'
import { PHOTOS } from '~/data/photos'
import type { MenuItem } from '~/types/menu'
import { formatPeso } from '~/utils'

const props = defineProps<{ item: MenuItem }>()
const emit = defineEmits<{ (e: 'add', id: number): void }>()

const reduced = useReducedMotion()
const justAdded = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

const image = computed(() => (props.item.image ? PHOTOS[props.item.image] : undefined))

// A keyframe array replays each time the value changes, so flipping
// justAdded true -> false -> true re-runs the spring every tap.
const cardTarget = computed(() =>
  (justAdded.value && !reduced.value) ? { scale: [1, 1.04, 1] } : { scale: 1 })

const spring = {
  duration: MOTION.duration.med + 0.14,
  ease: MOTION.ease.spring,
}

function add(fromButton = false) {
  emit('add', props.item.id)
  justAdded.value = true

  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { justAdded.value = false }, 520)

  // A short haptic tick confirms the tap on a phone without stealing the toast.
  if (fromButton && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate?.(10) } catch { /* not supported */ }
  }

  toast.success(`${props.item.name} added`, {
    description: `${formatPeso(props.item.price)} · tap the cart to review`,
  })
}

onBeforeUnmount(() => { if (resetTimer) clearTimeout(resetTimer) })
</script>

<template>
  <motion.article
    :class="[
      'lift-card lift-card-hover group/menu relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card touch-manipulation',
    ]"
    :animate="cardTarget"
    :transition="spring"
    role="button"
    :tabindex="0"
    :aria-label="`Add ${item.name} to order, ${formatPeso(item.price)}`"
    @click="add()"
    @keydown.enter.prevent="add()"
    @keydown.space.prevent="add()"
  >
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      <ShimmerBlock v-if="!image" ratio="aspect-[4/3]" rounded="rounded-none" />
      <NuxtImg
        v-else
        :src="image.src"
        :alt="image.alt"
        :width="image.width"
        :height="image.height"
        sizes="xs:50vw sm:45vw md:30vw xl:280px"
        class="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/menu:scale-[1.06]"
        loading="lazy"
      />
    </div>

    <div class="flex flex-1 flex-col gap-1 p-3">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-card leading-tight">{{ item.name }}</h3>
        <span class="tnum shrink-0 font-mono text-body font-semibold text-primary">
          {{ formatPeso(item.price) }}
        </span>
      </div>
      <p class="text-meta text-pretty text-muted-foreground">{{ item.desc }}</p>

      <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">
        <Badge variant="secondary" class="text-label capitalize">{{ item.cat }}</Badge>

        <!-- Visual affordance only — the whole card is the button, so this is
             hidden from the a11y tree to avoid a duplicate control. -->
        <span
          class="pointer-events-none flex size-8 shrink-0 items-center justify-center rounded-md border border-border"
          :class="justAdded ? 'border-transparent bg-primary text-primary-foreground' : 'text-muted-foreground'"
          aria-hidden="true"
        >
          <Check v-if="justAdded" class="size-4" />
          <Plus v-else class="size-4" />
        </span>
      </div>
    </div>
  </motion.article>
</template>
