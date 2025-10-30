<template>
    <header class="sticky top-0 z-50">
        <div class="backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
            <div class="container mx-auto px-6 py-3 flex justify-between items-center">
                <div class="flex flex-col gap-2 w-full">
                    <slot></slot>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">

</script>