import {TriggerEvent} from "./AddCard.tsx";

export interface AblReqProto {
    mana?: number;
    sacrifice?: boolean;
    emptyDeployZone?: boolean;
    nestedArgs?: boolean;
    selectedCardAmount?: number;
    selectablePositions?: {
        self: string[];
        opponent: string[];
        allowCrossTarget: boolean;
        targetAmount: number;
    };
}

export interface AbilityBaseProto {
    [key: string]: any;
    description: string;
    type: string;
    usageType: string;
    subtype: string;
    requirements?: AblReqProto;
}

export interface CostModAblProto extends AbilityBaseProto {
    deploy: number;
    action: number;
    passive: number;
}

export interface AttributeModAblProto extends AbilityBaseProto {
    attack: number;
    defence: number;
}

export interface InstantAblProto extends AbilityBaseProto {
    name: string;
    args?: object | string;
}

export interface EventDrivenAblProto extends AbilityBaseProto {
    event: TriggerEvent[];
    selfTriggered: boolean;
}

export type AbilityProto =
    CostModAblProto |
    AttributeModAblProto |
    InstantAblProto |
    EventDrivenAblProto |
    AbilityBaseProto;

export interface TargetablePosesProto {
    self: string[],
    opponent: string[],
    allowCrossTarget: boolean,
    targetAmount: number
}

export interface CardProto {
    name: string;
    deck: string;
    cost: number;
    attack: number;
    defence: number;
    pieces: number;
}

export interface TargetablePos {
    position: string;
    self: boolean;
    opponent: boolean;
}