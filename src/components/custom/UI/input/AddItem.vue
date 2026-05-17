<template>
    <InputGroup class="flex-1 border bg-white border-gray-300 rounded-xl pe-1 text-sm w-full focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <textarea 
            ref="textareaRef"
            v-model="inputValue"
            :disabled="isRecording"
            type="text"
            placeholder="New checklist item..."
            :rows="1"
            class="w-full resize-none overflow-hidden bg-transparent px-3 py-2 outline-none"
            @mousemove="handleMouseMove"
            @input="autoResize"
            @keydown.enter.exact.prevent="addItem"
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
  InputGroupButton,
  InputGroupTextarea
} from "@/components/ui/input-group";
import { Mic, Plus } from "lucide-vue-next";
import { ref, watch, computed, nextTick } from 'vue';
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

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function autoResize() {
    const el = textareaRef.value;
    if (!el) return;
    el.style.cursor = 'none';
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
}

function handleMouseMove() {
    const el = textareaRef.value;
    if (!el) return;
    el.style.cursor = 'text';
}

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