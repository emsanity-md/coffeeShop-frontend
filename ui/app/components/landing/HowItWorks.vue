<script setup lang="ts">
/** Three-step walkthrough of the actual flow. */
import { ClipboardList, HandCoins, PackageCheck } from '@lucide/vue'
import { motion, useReducedMotion } from 'motion-v'
import { MOTION } from '~/composables/useMotionPreset'
import type { Component } from 'vue'

interface Step {
  n: number
  icon: Component
  title: string
  body: string
}

const steps: Step[] = [
  {
    n: 1,
    icon: ClipboardList,
    title: 'Build the order',
    body: 'Tap a card to add it, adjust quantities inline, search when someone asks for something off-menu.',
  },
  {
    n: 2,
    icon: HandCoins,
    title: 'Split by customer',
    body: 'Name the people at the table. The total divides evenly and the remainder cent is handed out fairly.',
  },
  {
    n: 3,
    icon: PackageCheck,
    title: 'Track it through',
    body: 'The order lands in the queue as pending. Move it along to preparing, ready, then completed.',
  },
]
</script>

<template>
  <section id="how-it-works" class="scroll-mt-20 border-t border-border">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <RevealOnScroll class="max-w-2xl">
        <p class="text-label text-primary">How it works</p>
        <h2 class="mt-2 text-display">Three steps, start to pickup</h2>
      </RevealOnScroll>

      <StaggerList class="mt-10 grid gap-6 md:grid-cols-3" :stagger="0.12">
        <StaggerItem v-for="step in steps" :key="step.n" class="relative">
          <!-- Connector, desktop only. Hidden on the last step. -->
          <div
            v-if="step.n < steps.length"
            aria-hidden="true"
            class="absolute left-[2.125rem] top-4 hidden h-px w-[calc(100%-1rem)] bg-border md:block"
          />
          <div class="relative">
            <span class="flex size-9 items-center justify-center rounded-full border border-border bg-card">
              <component :is="step.icon" class="size-4 text-primary" />
            </span>
            <p class="text-label mt-4 text-muted-foreground">
              Step {{ step.n }}
            </p>
            <h3 class="mt-1 text-section">{{ step.title }}</h3>
            <p class="mt-1.5 text-body text-pretty text-muted-foreground">{{ step.body }}</p>
          </div>
        </StaggerItem>
      </StaggerList>
    </div>
  </section>
</template>
