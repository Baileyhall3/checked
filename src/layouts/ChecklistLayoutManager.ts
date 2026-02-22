import { DataObject } from "supabase-dataobject-core";
import { reactive } from "vue";

export type ChecklistSort = 'recent' | 'name' | 'priority' | 'dueDate'
export interface ChecklistItemsView {
    progressBar: boolean;
    createNew: boolean;
    checked: boolean;
    deleted: boolean;
}

export default class ChecklistLayout {
    private _key?: string;
    private _onPreferenceUpdated: (pPreference: any, pValue: any) => void;
    private _dataObject: DataObject | undefined = undefined;

    preferences = reactive<{
        currentSort: ChecklistSort;
        itemsView: ChecklistItemsView;
    }>({
        currentSort: 'recent',
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

    updateView(key: keyof typeof this.preferences.itemsView) {
        this.preferences.itemsView[key] = !this.preferences.itemsView[key];
        this._onPreferenceUpdated(key, this.preferences.itemsView[key]);
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