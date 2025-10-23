<template>
    <InputGroup class="bg-white rounded-xl ">
        <InputGroupInput placeholder="Search..." type="text" />
        <InputGroupAddon>
            <Search :size="16" aria-hidden="true" />
        </InputGroupAddon>
    </InputGroup>
</template>

<script setup lang="ts">
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-vue-next";

</script>