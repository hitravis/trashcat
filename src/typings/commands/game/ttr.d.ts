interface DistrictPopulationByDistrict {
    [key: string]: number,
};

interface DistrictStatusByDistrict {
    [key: string]: string
}

export interface DistrictPopulationData {
    lastUpdated: number,
    totalPopulation: number,
    populationByDistrict: DistrictPopulationByDistrict,
    statusByDistrict: DistrictStatusByDistrict,
};

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
