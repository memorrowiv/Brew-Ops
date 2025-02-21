import { Keg } from "./keg.models";

export interface Tap {
    number: number;
    assignedKeg: Keg | null;
    isLastKeg: boolean;
}