<script setup lang="ts">
/**
 * Per-character rise-in, letter by letter.
 *
 * Used for the receipt total and the hero headline. Words stay grouped so the
 * text remains selectable and screen readers read it as one string — splitting
 * every character into its own element would break both.
 */
import { computed } from 'vue'
import { motion, useReducedMotion } from 'motion-v'
import { MOTION } from '~/composables/useMotionPreset'

const props = withDefaults(defineProps<{
  text: string
  /** Seconds between letters. */
  stagger?: number
  delay?: number
  as?: string
}>(), { stagger: 0.022, delay: 0, as: 'span' })

const reduced = useReducedMotion()

const words = computed(() =>
  props.text.split(' ').map(word => ({
    chars: [...word].map((char, i) => ({ char, key: `${word}-${i}` })),
  })),
)

/** Running letter index, so a space doesn't reset the cascade timing. */
function letterDelay(charIndex: number, wordIndex: number) {
  let offset = 0
  for (let w = 0; w < wordIndex; w++) offset += words.value[w]!.chars.length + 1
  return props.delay + (offset + charIndex) * props.stagger
}
</script>

<template>
  <component :is="props.as" :aria-label="text" class="inline-block">
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true">
      <span
        v-for="(word, wi) in words"
        :key="wi"
        class="inline-block whitespace-nowrap"
      >
        <motion.span
          v-for="(c, ci) in word.chars"
          :key="c.key"
          class="inline-block"
          :initial="reduced ? { opacity: 0 } : { opacity: 0, y: '0.5em' }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{
            duration: MOTION.duration.med,
            ease: MOTION.ease.warm,
            delay: letterDelay(ci, wi),
          }"
        >{{ c.char }}</motion.span>
        <span v-if="wi < words.length - 1">&nbsp;</span>
      </span>
    </span>
  </component>
</template>
