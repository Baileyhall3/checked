import { DataObject } from "supabase-dataobject-core";
import { reactive } from "vue";

export type FolderSort = 'recent' | 'created' | 'name';
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
        sortDirection?: 'asc' | 'desc';
        listView: FolderListView;
        checklistsView: ChecklistsView;
    }>({
        currentSort: 'recent',
        sortDirection: 'desc',
        listView: 'checklists',
        checklistsView: {
            completed: true,
            deleted: false
        }
    });

    get localStorageKey() {
        return `${this._key}`;
    }

    /*
     * Preference Getters
     */
    get currentSort() {
        return this.preferences.currentSort;
    }

    get sortDirection() {
        return this.preferences.sortDirection ?? 'desc';
    }

    get listView() {
        return this.preferences.listView;
    }

    get showCompleted() {
        return this.preferences.checklistsView.completed;
    }

    get showDeleted() {
        return this.preferences.checklistsView.deleted;
    }

    /*
     * Preference Setters
     */
    set currentSort(sort: FolderSort) {
        this.updateSort(sort);
    }

    set sortDirection(direction: 'asc' | 'desc') {
        this.updateSortDirection(direction);
    }

    set listView(view: FolderListView) {
        this.updateGroupBy(view);
    }

    set showCompleted(value: boolean) {
        this.toggleView('completed', value);
    }
    
    set showDeleted(value: boolean) {
        this.toggleView('deleted', value);
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

    updateSortDirection(direction: 'asc' | 'desc') {
        this.preferences.sortDirection = direction;
        this._onPreferenceUpdated('sortDirection', direction);
        this._saveToStorage();
    }

    updateGroupBy(view: FolderListView) {
        this.preferences.listView = view;
        this._onPreferenceUpdated('listView', this.preferences.listView);
        this._saveToStorage();
    }

    toggleView(key: keyof typeof this.preferences.checklistsView, pValue: boolean) {
        this.preferences.checklistsView[key] = pValue;
        this._onPreferenceUpdated(key, pValue);
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