import { DataObject } from "supabase-dataobject-core";
import type { GroupByConfig } from "supabase-dataobject-core/dist/types";
import { reactive } from "vue";

export type ChecklistSort = 'recent' | 'name' | 'priority' | 'dueDate' | 'custom';
export interface ChecklistItemsView {
    progressBar: boolean;
    createNew: boolean;
    checked: boolean;
    deleted: boolean;
}
export interface ChecklistItemFieldsView {
    description: boolean;
    priority: boolean;
    dueDate: boolean;
    members: boolean;
    createdAt: boolean;
    createdBy: boolean;
    updatedAt: boolean;
    updatedBy: boolean;
}
export interface ChecklistPreferences {
    currentSort: ChecklistSort;
    sortDirection?: 'asc' | 'desc';
    itemsView: ChecklistItemsView;
    itemFieldsView: ChecklistItemFieldsView;
    groupBy?: GroupByConfig<any>;
}

export default class ChecklistLayout {
    private _key?: string;
    private _onPreferenceUpdated: (pPreference: any, pValue: any) => void;
    private _dataObject: DataObject | undefined = undefined;

    preferences = reactive<ChecklistPreferences>({
        currentSort: 'recent',
        sortDirection: 'desc',
        itemsView: {
            progressBar: true,
            createNew: true,
            checked: true,
            deleted: false
        },
        itemFieldsView: {
            description: true,
            priority: true,
            dueDate: true,
            members: true,
            createdAt: false,
            createdBy: false,
            updatedAt: false,
            updatedBy: false
        },
        groupBy: undefined
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

    get showDescription() {
        return this.preferences.itemFieldsView.description;
    }

    get showPriority() {
        return this.preferences.itemFieldsView.priority;
    }

    get showDueDate() {
        return this.preferences.itemFieldsView.dueDate;
    }

    get showMembers() {
        return this.preferences.itemFieldsView.members;
    }

    get showCreatedAt() {
        return this.preferences.itemFieldsView.createdAt;
    }

    get showCreatedBy() {
        return this.preferences.itemFieldsView.createdBy;
    }

    get showUpdatedAt() {
        return this.preferences.itemFieldsView.updatedAt;
    }

    get showUpdatedBy() {
        return this.preferences.itemFieldsView.updatedBy;
    }

    get groupBy() {
        return this.preferences.groupBy;
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

    set showDescription(value: boolean) {
        this.updateItemFieldView('description', value);
    }

    set showPriority(value: boolean) {
        this.updateItemFieldView('priority', value);
    }

    set showDueDate(value: boolean) {
        this.updateItemFieldView('dueDate', value);
    }

    set showMembers(value: boolean) {
        this.updateItemFieldView('members', value);
    }

    set showCreatedAt(value: boolean) {
        this.updateItemFieldView('createdAt', value);
    }

    set showCreatedBy(value: boolean) {
        this.updateItemFieldView('createdBy', value);
    }

    set showUpdatedAt(value: boolean) {
        this.updateItemFieldView('updatedAt', value);
    }

    set showUpdatedBy(value: boolean) {
        this.updateItemFieldView('updatedBy', value);
    }

    set groupBy(groupBy: GroupByConfig<any> | undefined) {
        this.updateGroupBy(groupBy);
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
        this.preferences.itemsView[key] = pValue;
        this._onPreferenceUpdated(key, pValue);
        this._saveToStorage();
    }

    updateItemFieldView(key: keyof ChecklistItemFieldsView, pValue: boolean) {
        this.preferences.itemFieldsView[key] = pValue;
        this._onPreferenceUpdated(key, pValue);
        this._saveToStorage();
    }

    updateGroupBy(groupBy: GroupByConfig<any> | undefined) {
        this.preferences.groupBy = groupBy;
        this._onPreferenceUpdated('groupBy', groupBy);
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