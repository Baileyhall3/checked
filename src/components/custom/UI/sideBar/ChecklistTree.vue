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
      v-slot="{ isExpanded, handleSelect }"
      :style="{ paddingLeft: `${item.level - 0.5}rem` }"
      class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
      >
      <FolderTreeItem 
        v-if="item.hasChildren" 
        :id="item.value.folderId"
        :is-expanded="isExpanded"
        :title="item.value.title"
      />
      <ChecklistTreeItem 
        v-else
        @click="onItemClick(handleSelect, item)"
        :title="item.value.title"
        :id="item.value.checklistId"
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

  return dataSources.myFolders.data.map(folder => ({
    title: folder.name,
    icon: 'lucide:folder',
    type: 'folder',
    folderId: folder.id,
    children: (checklistsByFolder[folder.id] || []).map(cl => ({
      title: cl.name,
      icon: 'lucide:list-check',
      type: 'checklist',
      checklistId: cl.id
    }))
  }))
});

const onItemClick = (
  handleSelect: () => void,
  item: any
) => {
  // Let Reka handle selection
  handleSelect()

  // Only close on mobile AND only for leaf items
  if (sideBarState.isMobile && !item.hasChildren) {
    sideBarState.isSidebarOpen = false
  }
}
</script>