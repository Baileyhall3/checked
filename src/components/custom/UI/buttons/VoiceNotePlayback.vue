<template>
    <Button
        v-if="item.voice_note_path"
        variant="secondary"
        size="sm"
        @click="togglePlayback"
        >
        <component :is="isPlaying ? Pause : Play" :size="14" />
    </Button>
    <span
        v-if="duration > 0"
        class="text-xs text-gray-500 ms-2"
    >
        {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
    </span>

    <audio ref="audioEl" class="hidden" />
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-vue-next";
import { DataObject, DataObjectRecord } from "supabase-dataobject-core";
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
    item: DataObjectRecord<any>;
    dataObject: DataObject
}>();

const isPlaying = ref<boolean>(false);
const audioEl = ref<HTMLAudioElement | null>(null);
const duration = ref<number>(0);
const currentTime = ref<number>(0);

const remainingTime = computed(() => {
  return Math.max(duration.value - currentTime.value, 0)
})

onMounted(() => {
  if (!audioEl.value) return

  audioEl.value.onloadedmetadata = () => {
    duration.value = audioEl.value?.duration ?? 0
  }

  audioEl.value.ontimeupdate = () => {
    currentTime.value = audioEl.value?.currentTime ?? 0
  }

  audioEl.value.onended = () => {
    isPlaying.value = false;
    currentTime.value = 0;
  }
})

async function togglePlayback() {
  if (!props.item.voice_note_path) return
  if (!audioEl.value) return

  if (!isPlaying.value) {
    const url = await props.dataObject.storage.createSignedUrl(
      'checklist-item-voice-notes',
      props.item.voice_note_path,
      60 * 10 // 10 mins
    )

    if (!url) return

    audioEl.value.src = url
    await audioEl.value.play()
    isPlaying.value = true

    audioEl.value.onended = () => {
      isPlaying.value = false
    }

  } else {
    audioEl.value.pause()
    isPlaying.value = false
  }
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>