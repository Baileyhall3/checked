import {
  initializeDataObjectManager,
  createDataObject
} from 'supabase-dataobject-core';
import { DataObjectManager, DataObject } from 'supabase-dataobject-core';
import type { DataObjectErrorHandler, DataObjectField } from 'supabase-dataobject-core';
import { reactive } from 'vue';
import { useToast } from '@/components/ui/toast';
import { SupabaseClient } from '@supabase/supabase-js';

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
    checklistsNoFolderLkp: null as DataObject | null,
    deletedChecklists: null as DataObject | null,
    templateChecklists: null as DataObject | null,
    themes: null as DataObject | null,
    readNotifications: null as DataObject | null,
    unreadNotifications: null as DataObject | null,
    globalNotificationPreferences: null as DataObject | null,
    userFriends: null as DataObject | null,
});

/**
 * Initializes all data objects to be used within the app. 
 * MUST stay in the current order, due to master-child bindings
 * @param supabase 
 * @param currentUserId 
 */
export async function initDataObjects(supabase: SupabaseClient, currentUserId: number) {
    dataSources.manager = initializeDataObjectManager({
        supabaseClient: supabase,
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
        whereClauses: [
            { field: 'deleted_at', operator: 'isnull' }
        ],
        fields: checklistFields
    }); 

    dataSources.deletedChecklists = await createDataObject('deleted_checklists', {
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
        whereClauses: [
            { field: 'deleted_at', operator: 'isnotnull' }
        ],
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
        sort: { field: "content_updated_at", direction: 'desc' }, // TODO: handle null values
        fields: folderFields
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

    dataSources.templateChecklists = await createDataObject('template_checklists', {
        viewName: 'checklists_view',
        tableName: 'checklists',
        autoRefresh: false,
        whereClauses: [
            { field: 'owner_id', operator: 'equals', value: currentUserId },
            { field: 'folder_id', operator: 'isnull' },
            { field: 'is_template', operator: 'equals', value: true }
        ],
        fields: checklistFields
    }); 

    dataSources.themes = await createDataObject('themes', {
        viewName: 'themes',
        tableName: 'themes',
        fields: themesFields
    });

    dataSources.readNotifications = await createDataObject('readNotifications', {
        viewName: 'notifications_view',
        tableName: 'notifications',
        fields: notificationFields,
        canInsert: true,
        canUpdate: true,
        canDelete: true,
        masterDataObjectBinding: {
            masterDataObjectId: 'user',
            childBindingField: 'user_id',
            masterBindingField: 'id'
        },
        whereClauses: [
            { field: 'read', operator: 'equals', value: true }
        ],
        sort: [
            { field: 'created_at', direction: 'desc'}
        ]
    });

    dataSources.unreadNotifications = await createDataObject('unreadNotifications', {
        viewName: 'notifications_view',
        tableName: 'notifications',
        fields: notificationFields,
        canInsert: true,
        canUpdate: true,
        canDelete: true,
        masterDataObjectBinding: {
            masterDataObjectId: 'user',
            childBindingField: 'user_id',
            masterBindingField: 'id'
        },
        whereClauses: [
            { field: 'read', operator: 'equals', value: false }
        ],
        sort: [
            { field: 'created_at', direction: 'desc'}
        ]
    });

    dataSources.globalNotificationPreferences = await createDataObject('globalNotificationPreferences', {
        viewName: 'notification_preferences_global_view',
        tableName: 'notification_preferences_global',
        fields: notificationPreferencesFields,
        canUpdate: true,
        masterDataObjectBinding: {
            masterDataObjectId: 'user',
            childBindingField: 'user_id',
            masterBindingField: 'id'
        },
        sort: [
            { field: 'type', direction: 'desc'}
        ]
    });

    dataSources.userFriends = await createDataObject('userFriends', {
        viewName: 'friends_view',
        tableName: 'friends',
        fields: friendFields,
        canInsert: false,
        canUpdate: true,
        canDelete: true,
        masterDataObjectBinding: {
            masterDataObjectId: 'user',
            childBindingField: 'owner_user_id',
            masterBindingField: 'id'
        },
        sort: [
            { field: 'created_at', direction: 'desc'}
        ],
        whereClauses: [
            { field: 'status', operator: 'equals', value: 'accepted' }
        ]
    });

    console.log('data sources: ', dataSources);
}


// #region Fields
const userFields : DataObjectField[] = [
    { name: "id" },
    { name: "prim_key" },
    { name: "username" },
    { name: "email" },
    { name: "created_at" },
    { name: "profile_picture_url" },
    { name: "auth_id" },
    { name: "bg_colour" },
    { name: "default_view_type" },
    { name: "default_view_id" },
    { name: "last_opened_type" },
    { name: "last_opened_id" },
];

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
    { name: "folder_id" },
    { name: "folder_name" },
    { name: "voice_note_path" }
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
    { name: "created_by_id" },
    { name: "created_by_username" },
    { name: "copied_from_id" },
    { name: "copied_from_name" },
    { name: "completed_at" },
    { name: "completed_by_id" },
    { name: "completed_by_username" },
    { name: "theme_id" },
    { name: "theme" },
    { name: "theme_config" },
    { name: "is_member" }
]

export const folderFields: DataObjectField[] = [
    { name: "id" },
    { name: "prim_key" },
    { name: "name" },
    { name: "user_id" },
    { name: "created_at" },
    { name: "username" },
    { name: "checklist_count" },
    { name: "pin_protected_at" },
    { name: "pin_hash" },
    { name: "pin_type" },
    { name: "content_updated_at" }
]

export const themesFields: DataObjectField[] = [
    { name: "id" },
    { name: "name" },
    { name: "config" },
    { name: "created_at" },
    { name: "owner_id" },
    { name: "is_public" },
    { name: "is_premium" },
]

export const notificationFields: DataObjectField[] = [
    { name: "id" },
    { name: "created_at" },
    { name: "user_id" },
    { name: "type" },
    { name: "checklist_id" },
    { name: "checklist" },
    { name: "item_id" },
    { name: "checklist_item" },
    { name: "actor_user_id" },
    { name: "username" },
    { name: "data" },
    { name: "read" },
    { name: "priority" },
    { name: "expires_at" },
    { name: "type_muted" }
]

export const notificationPreferencesFields: DataObjectField[] = [
    { name: "id" },
    { name: "user_id" },
    { name: "type" },
    { name: "description" },
    { name: "supports_email" },
    { name: "supports_push" },
    { name: "allow_push" },
    { name: "allow_email" },
]

export const friendFields: DataObjectField[] = [
    { name: "id" },
    { name: "owner_user_id" },
    { name: "friend_user_id" },
    { name: "username" },
    { name: "profile_picture_url" },
    { name: "bg_colour" },
    { name: "created_at" },
    { name: "status" },
    { name: "created_by_id" }
]