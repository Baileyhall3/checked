import { DataObject } from "supabase-dataobject-core";
import { reactive } from "vue";

export type FolderSort = 'recent' | 'created' | 'name'
export type FolderListView = 'checklists' | 'items';
export interface ChecklistsView {
    completed: boolean;
    deleted: boolean;
}

export default class FolderLayout {
    private _key?: string;
    private _onPreferenceUpdated: (pPreference: any, pValue: any) => void;
    private _dataObject: DataObject | undefined = undefined;

    preferences = reactive<{
        currentSort: FolderSort;
        listView: FolderListView;
        checklistsView: ChecklistsView;
    }>({
        currentSort: 'recent',
        listView: 'checklists',
        checklistsView: {
            completed: true,
            deleted: false
        }
    });

    get localStorageKey() {
        return `${this._key}`;
    }

    constructor(pOptions: {
        key: string;
        onPreferenceUpdated: (pPreference: any, pValue: any) => void;
        dataObject?: DataObject;
    }) {
        this._key = pOptions.key;
        this._onPreferenceUpdated = pOptions.onPreferenceUpdated;
        this._dataObject = pOptions.dataObject;
        this._loadFromStorage();
    }

    updateSort(sort: FolderSort) {
        this.preferences.currentSort = sort;
        this._onPreferenceUpdated('currentSort', sort);
        this._saveToStorage();
    }

    updateGroupBy(view: FolderListView) {
        this.preferences.listView = view;
        this._onPreferenceUpdated('listView', this.preferences.listView);
        this._saveToStorage();
    }

    toggleView(key: keyof typeof this.preferences.checklistsView) {
        this.preferences.checklistsView[key] = !this.preferences.checklistsView[key];
        this._onPreferenceUpdated(key, this.preferences.checklistsView[key]);
        this._saveToStorage();
    }

    private _saveToStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.preferences));
    }

    private _loadFromStorage() {
        const storedPreferences = localStorage.getItem(this.localStorageKey);
        if (storedPreferences) {            
            const parsed = JSON.parse(storedPreferences);
            Object.assign(this.preferences, parsed);
        }
    }
}