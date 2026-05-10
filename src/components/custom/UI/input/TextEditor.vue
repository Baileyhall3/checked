<template>
    <div class="rounded-xl border border-gray-300">
        <!-- Toolbar -->
        <div class="flex flex-wrap justify-between items-center border-b border-gray-200 px-2 py-1 bg-gray-50 rounded-t-xl">
            <div class="flex gap-1">
                <button
                    v-if="!props.hideBold"
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Bold"
                    @click="exec('bold')"
                >
                    <BoldIcon class="w-3 h-3" />
                </button>
                <button
                    v-if="!props.hideItalic"
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Italic"
                    @click="exec('italic')"
                >
                    <ItalicIcon class="w-3 h-3" />
                </button>
                <button
                    v-if="!props.hideUnderline"
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Underline"
                    @click="exec('underline')"
                >
                    <UnderlineIcon class="w-3 h-3" />
                </button>
                <button
                    v-if="!props.hideBulletList"
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Bullet List"
                    @click="exec('insertUnorderedList')"
                >
                    <List class="w-3 h-3" />
                </button>
                <button
                    v-if="!props.hideNumberedList"
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Numbered List"
                    @click="exec('insertOrderedList')"
                >
                    <ListOrdered class="w-3 h-3" />
                </button>
            </div>

            <!-- Undo/Redo buttons -->
            <div class="flex gap-1">
                <button
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Undo"
                    @click="exec('undo')"
                >
                    <CornerUpLeftIcon class="w-3 h-3" />
                </button>
                <button
                    type="button"
                    class="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                    title="Redo"
                    @click="exec('redo')"
                >
                    <CornerUpRight class="w-3 h-3" />
                </button>
            </div>
        </div>

        <!-- Editable Area -->
        <div
            ref="editor"
            class="rich-editor p-2 min-h-[8rem] outline-none text-sm sm:text-base overflow-y-auto"
            contenteditable="true"
            :data-placeholder="props.placeholder"
            @input="onInput"
            @paste="sanitizePaste"
        ></div>

        <!-- <div class="flex flex-wrap justify-between items-center border-t border-gray-200 px-2 py-1 bg-gray-50 rounded-b-xl">
            <div class="flex gap-1 justify-end w-full">
                <Button variant="secondary" size="sm" @click="cancelChanges">
                    Cancel
                </Button>
                <Button size="sm" @click="saveChanges">
                    Save
                </Button>
            </div>
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { 
    BoldIcon, 
    ItalicIcon, 
    UnderlineIcon, 
    List, 
    ListOrdered, 
    CornerUpLeftIcon, 
    CornerUpRight 
} from 'lucide-vue-next';
import { ref, watch, onMounted } from 'vue';
import { Button } from "@/components/ui/button";


const props = defineProps<{
    modelValue: string;
    placeholder?: string;
    hideBold?: boolean;
    hideItalic?: boolean;
    hideUnderline?: boolean;
    hideBulletList?: boolean;
    hideNumberedList?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const editor = ref<HTMLElement | null>(null);
const lastEmittedValue = ref(props.modelValue);

function exec(command: string) {
    document.execCommand(command, false);
    emitUpdatedValue();
}

function onInput() {
    emitUpdatedValue();
}

function emitUpdatedValue() {
    const html = editor.value?.innerHTML || '';
    lastEmittedValue.value = html;
    emit('update:modelValue', html);
}

watch(() => props.modelValue,
    (newVal) => {
        if (editor.value && newVal !== lastEmittedValue.value) {
            editor.value.innerHTML = newVal;
            lastEmittedValue.value = newVal;
        }
    }
);

/**
 * Strip unwanted HTML tags on paste
 */
function sanitizePaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    const html = event.clipboardData?.getData('text/html') || '';
    const temp = document.createElement('div');
    temp.innerHTML = html || text;

    const allowedTags = ['B', 'I', 'U', 'UL', 'OL', 'LI', 'BR'];
    const sanitizeNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (!allowedTags.includes(el.tagName)) {
                const span = document.createElement('span');
                span.innerHTML = el.innerHTML;
                el.replaceWith(...span.childNodes);
            } else {
                Array.from(el.childNodes).forEach(sanitizeNode);
            }
        }
    };

    Array.from(temp.childNodes).forEach(sanitizeNode);
    document.execCommand('insertHTML', false, temp.innerHTML);
}

onMounted(() => {
    if (editor.value && props.modelValue) {
        editor.value.innerHTML = props.modelValue;
        lastEmittedValue.value = props.modelValue;
    }
});
</script>

<style scoped>
/* Placeholder styling */
[contenteditable][data-placeholder]:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af; /* Tailwind's gray-400 */
    pointer-events: none;
    position: absolute;
}
</style>
<style>
    .rich-editor ul {
        list-style: disc;
        padding-left: 1.5rem;
    }

    .rich-editor ol {
        list-style: decimal;
        padding-left: 1.5rem;
    }

    .rich-editor li {
        margin-left: 0.25rem;
    }
    </style>
