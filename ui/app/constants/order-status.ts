import type { Component } from 'vue'
import { CircleCheck, CircleX, Clock, Flame, Bell, RotateCcw } from '@lucide/vue'
import type { OrderStatus } from '~/types/order'

/** All statuses, in lifecycle order. `cancelled` is terminal, not a step. */
export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

/** The happy path, in order — drives the stepper and the dropdown menu. */
export const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed']

export const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled']

export interface StatusMeta {
  label: string
  /** Maps to a `--status-*` design token in assets/css/theme.css. */
  tone: string
  icon: Component
  /** Short description used on the landing-page lifecycle explainer. */
  blurb: string
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: 'Pending',
    tone: 'var(--status-pending)',
    icon: Clock,
    blurb: 'Order is in the queue',
  },
  preparing: {
    label: 'Preparing',
    tone: 'var(--status-preparing)',
    icon: Flame,
    blurb: 'Barista is on it',
  },
  ready: {
    label: 'Ready',
    tone: 'var(--status-ready)',
    icon: Bell,
    blurb: 'Waiting for pickup',
  },
  completed: {
    label: 'Completed',
    tone: 'var(--status-completed)',
    icon: CircleCheck,
    blurb: 'Handed over, paid',
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'var(--status-cancelled)',
    icon: CircleX,
    blurb: 'Voided — excluded from revenue',
  },
}

export const REOPEN_ICON = RotateCcw
