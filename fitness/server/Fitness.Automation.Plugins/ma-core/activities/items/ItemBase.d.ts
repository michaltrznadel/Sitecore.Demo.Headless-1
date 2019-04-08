import { Connector } from '../Connector';
import { InsertionPoint } from '../InsertionPoint';
import { IPlan } from '../IPlan';
import { Position } from './Position';
import { Visual } from './Visual';
export declare class ItemBase {
    protected _cssClass: string;
    visual: Visual;
    params: any;
    parent: ItemBase | undefined;
    root: IPlan;
    position: Position;
    children: ItemBase[];
    canBeSelected: boolean;
    canBeDeleted: boolean;
    hasFinal: boolean;
    private canSaveParametersForTemplate;
    constructor(itemData: any, root: IPlan, parent?: ItemBase);
    id: string;
    readonly activityTypeId: string;
    initParams(itemData: any): void;
    initChildren(itemData: any): void;
    toJson(isTemplate?: boolean): any;
    readonly hasVisual: boolean;
    getVisual(): string | undefined;
    setVisual(domElement: HTMLElement): void;
    computeChildrenOffsets(): void;
    computeXY(parentX: number, parentY: number): void;
    getConnectors(resultArray: Connector[]): void;
    getInserts(resultArray: InsertionPoint[]): void;
    readonly hasFrame: boolean;
    getFrame(): any;
    readonly hasLabel: boolean;
    getLabel(): string | undefined;
    editorParams: any;
    readonly isDefined: boolean;
    readonly isFinal: boolean;
    private stringifyPropertyValues(object);
    readonly cssClass: string;
    readonly hasDecisionPoint: boolean;
    saveParametersForTemplate: boolean;
}
