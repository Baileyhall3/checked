import {
  initializeDataObjectManager,
  createDataObject
} from 'supabase-dataobject-core';
import { DataObjectManager, DataObject } from 'supabase-dataobject-core';
import type { DataObjectErrorHandler } from 'supabase-dataobject-core';
import { reactive } from 'vue';

const errorHandler: DataObjectErrorHandler = {
    onError: (error: string) => {
        console.error('Supabase error:', error)
        throw new Error(error);
    },
    onWarning: (warning: string) => {
        console.warn('Supabase warning:', warning)
    },
    onInfo: (info: string) => {
        console.info('Supabase info:', info)
    }
}

export const dataSources = reactive({
    manager: null as DataObjectManager | null,
    user: null as DataObject | null,
    myChecklists: null as DataObject | null,
    checklistItems: null as DataObject | null,
    myFolders: null as DataObject | null
});

/**
 * Initializes all data objects to be used within the app. 
 * MUST stay in the current order, due to master-child bindings
 * @param url 
 * @param key 
 * @param currentUserId 
 */
export async function initDataObjects(url: string, key: string, currentUserId: number) {
    dataSources.manager = initializeDataObjectManager({
        supabaseConfig: { url, anonKey: key },
        errorHandler
    });

    dataSources.user = await createDataObject('user', {
        viewName: 'users',
        tableName: 'users',
        canInsert: false,
        canUpdate: true,
        canDelete: false,
        whereClauses: [
            { field: 'id', operator: 'equals', value: currentUserId }
        ],
        recordLimit: 1
    });
    
    dataSources.myChecklists = await createDataObject('my_checklists', {
        viewName: 'checklists_view',
        tableName: 'checklists',
        canInsert: true,
        canUpdate: true,
        canDelete: true,
        masterDataObjectBinding: {
            masterDataObjectId: 'user',
            childBindingField: 'owner_id',
            masterBindingField: 'id'
        },
        sort: { field: "created_at", direction: 'desc' },
        fields: [
            { name: "id" },
            { name: "prim_key" },
            { name: "name" },
            { name: "is_template" },
            { name: "created_at" },
            { name: "updated_at" },
            { name: "folder_id" },
            { name: "folder_name" },
            { name: "owner_id" },
            { name: "owner_username" },
            { name: "owner_email" },
            { name: "updated_by_id" },
            { name: "updated_by_username" },
            { name: "deleted_at" }
        ]
    }); 

    dataSources.myFolders = await createDataObject('my_folders', {
        viewName: 'checklist_folders_view',
        tableName: 'checklist_folders',
        canInsert: true,
        canUpdate: true,
        canDelete: true,
        masterDataObjectBinding: {
            masterDataObjectId: 'user',
            childBindingField: 'user_id',
            masterBindingField: 'id'
        },
        sort: { field: "created_at", direction: 'desc' },
        fields: [
            { name: "id" },
            { name: "prim_key" },
            { name: "name" },
            { name: "user_id" },
            { name: "created_at" },
            { name: "username" },
            { name: "checklist_count" },
        ]
    }); 

    console.log('data sources: ', dataSources);
}