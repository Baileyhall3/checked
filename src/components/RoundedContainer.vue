<template>
    <div class="bg-white rounded-xl" :class="props.class">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { HTMLAttributes } from 'vue';

// removed shadow-sm

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

</script>