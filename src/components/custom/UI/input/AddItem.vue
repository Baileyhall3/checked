<template>
    <InputGroup class="flex-1 border bg-white border-gray-300 rounded-xl pe-1 text-sm w-full h-full">
        <InputGroupInput 
            v-model="inputValue"
            :disabled="isRecording"
            type="text"
            placeholder="New checklist item..."
            class=""
            oninput="this.style.cursor='none';" 
            onmousemove="this.style.cursor='auto';"
            @keyup.enter="addItem"
        />
        <InputGroupAddon align="inline-end" v-if="!modelValue" @click="handleVoiceClick" :class="{ 'bg-red-100 animate-pulse text-red-500': isRecording }">
            <InputGroupButton size="icon-sm" aria-label="Subscribe">
                <Mic :size="16" />
            </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" v-if="modelValue && !isRecording" @click="addItem">
            <InputGroupButton size="icon-sm" aria-label="Subscribe">
                <Plus :size="16" />
            </InputGroupButton>
        </InputGroupAddon>
    </InputGroup>
</template>

<script setup lang="ts">
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton
} from "@/components/ui/input-group";
import { Mic, Plus } from "lucide-vue-next";
import { ref, watch, computed } from 'vue';
import { useVoiceRecorder } from '@/composables/useVoiceRecorder';

export interface IProps {
    modelValue: string
}
const props = defineProps<IProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'add-clicked'): void;
  (e: 'finished-voice-recording', blob: any): void;
}>();

const {
  isRecording,
  audioBlob,
  start,
  stop
} = useVoiceRecorder()

const inputValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
})

async function handleVoiceClick() {
    if (!isRecording.value) {
        await start()
    } else {
        stop()
    }
}

watch(audioBlob, async (blob) => {
    if (!blob) return

    emit("finished-voice-recording", blob);
});

function addItem() {
    emit("add-clicked");
}
</script>