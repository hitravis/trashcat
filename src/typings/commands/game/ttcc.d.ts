export interface DistrictPopulationData {
    name: string,
    online: boolean,
    population: number,
    invasion_online: boolean,
    last_update: number,
    cogs_attacking: string,
    count_defeated: number,
    count_total: number,
    remaining_time: number,
};

export interface GameInfo {
    num_toons: number,
    production_closed: boolean,
    production_closed_reason: string,
    version: string
};
