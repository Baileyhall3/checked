import { DataObject } from "supabase-dataobject-core";
import { reactive } from "vue";

export type ChecklistSort = 'recent' | 'name' | 'priority' | 'dueDate' | 'custom';
export interface ChecklistItemsView {
    progressBar: boolean;
    createNew: boolean;
    checked: boolean;
    deleted: boolean;
}
export interface ChecklistPreferences {
    currentSort: ChecklistSort;
    sortDirection?: 'asc' | 'desc';
    itemsView: ChecklistItemsView;
}

export default class ChecklistLayout {
    private _key?: string;
    private _onPreferenceUpdated: (pPreference: any, pValue: any) => void;
    private _dataObject: DataObject | undefined = undefined;

    preferences = reactive<ChecklistPreferences>({
        currentSort: 'recent',
        sortDirection: 'asc',
        itemsView: {
            progressBar: true,
            createNew: true,
            checked: true,
            deleted: false
        }
    });

    get localStorageKey() {
        return `${this._key}`;
    }

    get currentSort() {
        return this.preferences.currentSort;
    }

    get sortDirection() {
        return this.preferences.sortDirection;
    }

    get showProgressBar() {
        return this.preferences.itemsView.progressBar;
    }

    get showCreateNew() {
        return this.preferences.itemsView.createNew;
    }

    get showChecked() {
        return this.preferences.itemsView.checked;
    }

    get showDeleted() {
        return this.preferences.itemsView.deleted;
    }

    /*
     * Preference Setters
     */
    set currentSort(sort: ChecklistSort) {
        this.updateSort(sort);
    }

    set sortDirection(direction: 'asc' | 'desc') {
        this.updateSortDirection(direction);
    }

    set showProgressBar(value: boolean) {
        this.updateView('progressBar', value);
    }

    set showCreateNew(value: boolean) {
        this.updateView('createNew', value);
    }

    set showChecked(value: boolean) {
        this.updateView('checked', value);
    }

    set showDeleted(value: boolean) {
        this.updateView('deleted', value);
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

    updateSort(sort: ChecklistSort) {
        this.preferences.currentSort = sort;
        this._onPreferenceUpdated('currentSort', sort);
        this._saveToStorage();
    }

    updateSortDirection(direction: 'asc' | 'desc') {
        this.preferences.sortDirection = direction;
        this._onPreferenceUpdated('sortDirection', direction);
        this._saveToStorage();
    }

    updateView(key: keyof typeof this.preferences.itemsView, pValue: boolean) {
        debugger
        this.preferences.itemsView[key] = pValue;
        this._onPreferenceUpdated(key, pValue);
        this._saveToStorage();
    }

    private _saveToStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.preferences));
    }

    private _loadFromStorage() {
        const storedPreferences = localStorage.getItem(this.localStorageKey);
        if (storedPreferences) {
            // this.preferences = JSON.parse(storedPreferences);
            
            const parsed = JSON.parse(storedPreferences);
            Object.assign(this.preferences, parsed);
        }
    }
}