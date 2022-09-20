export interface Invasion extends Object {
    asOf: number,
    type: string,
    progress: string,
};

export interface FieldOffice extends Object {
    department: string,
    difficulty: number,
    annexes: number,
    open: boolean,
    expiring: number | null,
};

export interface FieldOfficeData extends Object {
    fieldOffices: Object<string, FieldOffice>,
    lastUpdated: number,
};
