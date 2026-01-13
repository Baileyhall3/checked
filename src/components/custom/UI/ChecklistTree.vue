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
      v-slot="{ isExpanded }"
      :style="{ paddingLeft: `${item.level - 0.5}rem` }"
      class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
    >
      <!-- Folder -->
      <template v-if="item.hasChildren">
        <component
          :is="isExpanded ? FolderOpen : Folder"
          class="h-4 w-4 text-gray-500"
        />
      </template>

      <!-- Checklist -->
      <template v-else>
        <Icon
          icon="lucide:list-check"
          class="h-4 w-4 text-gray-400"
        />
      </template>

      <span class="truncate">
        {{ item.value.title }}
      </span>
    </TreeItem>
  </TreeRoot>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { TreeRoot, TreeItem, } from 'reka-ui'
import { dataSources } from '@/api/dataObjects';
import { FolderOpen, Folder } from 'lucide-vue-next';


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
})
</script>