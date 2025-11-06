import {
  initializeDataObjectManager,
  createDataObject
} from 'supabase-dataobject-core';
import { DataObjectManager, DataObject } from 'supabase-dataobject-core';
import type { DataObjectErrorHandler, DataObjectField } from 'supabase-dataobject-core';
import { reactive } from 'vue';
import { useToast } from '@/components/ui/toast';

const { toast } = useToast();

const errorHandler: DataObjectErrorHandler = {
    onError: (error: string) => {
        console.error('Supabase error:', error)
        toast({
            title: 'An error occurred',
            description: error,
            variant: "destructive"
        });
        throw new Error(error);
    },
    onWarning: (warning: string) => {
        console.warn('Supabase warning:', warning)
        toast({
            title: 'An error occurred',
            description: `Error: ${warning}`,
            variant: "default"
        });
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
    myFolders: null as DataObject | null,
    checklistsNoFolderLkp: null as DataObject | null
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
        // whereClauses: [
        //     { field: 'folder_id', operator: 'isnull' }
        // ],
        fields: checklistFields
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

    dataSources.checklistsNoFolderLkp = await createDataObject('no_folder_checklists_lkp', {
        viewName: 'checklists_view',
        tableName: 'checklists',
        autoRefresh: false,
        whereClauses: [
            { field: 'owner_id', operator: 'equals', value: currentUserId },
            { field: 'folder_id', operator: 'isnull' }
        ],
        fields: checklistFields
    }); 

    console.log('data sources: ', dataSources);
}


// #region Fields

export const checklistItemsFields: DataObjectField[] = [
    { name: "id" },
    { name: "prim_key" },
    { name: "name" },
    { name: "description" },
    { name: "checklist_id" },
    { name: "is_checked" },
    { name: "created_at" },
    { name: "created_by_id" },
    { name: "created_by_username" },
    { name: "updated_at" },
    { name: "updated_by_id" },
    { name: "updated_by_username" },
    { name: "deleted_by_id" },
    { name: "deleted_by_username" },
    { name: "deleted_at" },
    { name: "checklist_is_deleted" },
    { name: "checklist" },
    { name: "checked_at" },
    { name: "checked_by_id" },
    { name: "checked_by_username" },
    { name: "locked_at" },
    { name: "locked_by_id" },
    { name: "locked_by_username" },
    { name: "due_date", type: "Date" },
    { name: "priority" },
    { name: "bg_colour" },
    { name: "sort_order" },
]

export const checklistFields: DataObjectField[] = [
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
    { name: "deleted_at" },
    { name: 'items_updated_at' },
    { name: "items_updated_by_id" },
    { name: "items_updated_by_username" },
    { name: "deleted_by_username" },
    { name: "items_count" },
    { name: "items_checked_count" },
    { name: "pin_protected_at" },
    { name: "pin_hash" },
    { name: "pin_set_by_id" },
    { name: "pin_set_by_username" },
    { name: "pin_type" },
]