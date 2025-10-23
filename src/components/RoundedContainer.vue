<template>
    <div class="bg-white shadow-md rounded-xl" :class="props.class">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { HTMLAttributes } from 'vue';

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

</script>