<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    :items="items"
    :get-key="item => `${item.type}-${item.folderId ?? item.checklistId}`"
    class="list-none select-none w-full bg-white rounded-lg"
  >
    <TreeItem
      v-for="item in flattenItems"
      :key="item._id"
      v-bind="item.bind"
      v-slot="{ isExpanded, handleSelect, handleToggle }"
      :style="{ paddingLeft: `${item.level - 0.5}rem` }"
      class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer min-w-0 w-full"
      :class="{ 'bg-gray-100 font-semibold' : isSelected(item)}"
      @mouseenter="sideBarState.hoveredItemKey = item._id"
      @mouseleave="sideBarState.hoveredItemKey = null"
      @toggle.prevent
    >
      <button
        v-if="item.hasChildren"
        class="flex-shrink-0"
        @click.stop="handleToggle()"
        aria-label="Toggle folder"
      >
        <component
          :is="isExpanded ? FolderOpen : Folder"
          class="h-4 w-4 text-gray-500"
        />
      </button>
      
      <div
        v-bind="item.bind"
        class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
      >
        <RouterLink
            v-if="item.hasChildren"
            :to="`/folder/${item.value.folderId}`" 
            class="flex items-center flex-1 min-w-0 truncate"
            @click.stop="handleSelect()"
          >
            {{ item.value.title }}
        </RouterLink>
        <router-link 
            v-else
            :to="`/checklist/${item.value.checklistId}`" 
            class="flex items-center w-full min-w-0"
        >
            <ListTodo 
                class="h-4 w-4 mr-2 flex-shrink-0 'text-gray-500'" 
            />
            <span class="truncate min-w-0 block">
                {{ item.value.title }}
            </span>
        </router-link>
      </div>

      <FolderActions
        v-if="item.hasChildren"
        :folder="item.value.folder"
        :is-hovered="sideBarState.hoveredItemKey === item._id || sideBarState.isMobile"
      />
    </TreeItem>
  </TreeRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TreeRoot, TreeItem, } from 'reka-ui'
import { dataSources } from '@/api/dataObjects';
import ChecklistTreeItem from './ChecklistTreeItem.vue';
import FolderTreeItem from './FolderTreeItem.vue';
import { sideBarState } from './sideBarState';
import { DataObjectRecord } from 'supabase-dataobject-core';
import FolderActions from './FolderActions.vue';
import { useRouter } from "vue-router";
import { FolderOpen, Folder, ListTodo } from 'lucide-vue-next';

const items = computed(() => {
  if (
    !dataSources.myFolders?.data ||
    !dataSources.myChecklists?.data
  ) {
    return []
  }

  const checklistsByFolder: Record<number, any[]> = {}

  for (const checklist of dataSources.myChecklists.data) {
    const folderId = checklist.folder_id ?? -1
    checklistsByFolder[folderId] ||= []
    checklistsByFolder[folderId].push(checklist)
  }

  return dataSources.myFolders.data.map((folder: DataObjectRecord) => ({
    title: folder.name,
    icon: 'lucide:folder',
    type: 'folder',
    folderId: folder.id,
    id: `folder-${folder.id}`,
    folder: folder,
    children: (checklistsByFolder[folder.id] || []).map((cl: DataObjectRecord) => ({
      title: cl.name,
      icon: 'lucide:list-check',
      type: 'checklist',
      checklistId: cl.id,
      id: `checklist-${cl.id}`,
      checklist: cl
    }))
  }))
});

const onItemClick = (
  handleSelect: () => void,
  item: any
) => {
  // Let Reka handle selection
  handleSelect()
  sideBarState.onTreeItemClick();
}

const router = useRouter();

function isSelected(item: any) {
  const route = router.currentRoute.value;
  const value = item.value;

  if (value.type === 'folder') {
    return (
      route.name === 'Folder' &&
      Number(route.params.id) === value.folderId
    )
  }

  if (value.type === 'checklist') {
    return (
      route.name === 'Checklist' &&
      Number(route.params.id) === value.checklistId
    )
  }

  return false
}
</script>