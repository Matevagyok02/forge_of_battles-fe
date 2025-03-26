import {IFriend} from "./pages/home/friends_panel/FriendsPanel.tsx";
import {WarTrackPos} from "./pages/battle/cards/CardSlot.tsx";

/*---Friend Interfaces---*/

export interface IFriendRequest {
    fromId: string;
    toId: string;
    userProps: { username: string, picture?: string };
}

export interface IReceiver {
    userId: string;
    username: string;
    picture?: string;
    status: string;
    unseenMessage: boolean;
}

export interface ISender {
    userId: string;
    username: string;
    picture?: string;
}

/*---Card Interfaces---*/

export interface RequirementArgs {
    cardToSacrifice?: string;
    useAsMana?: string[];
    targetPositions?: {
        self: string[],
        opponent: string[]
    },
    targetCards?: string[];
    nestedArgs?: RequirementArgs;
}

export interface AbilityRequirements {
    mana?: number,
    sacrifice?: boolean,
    emptyDeployZone?: boolean,
    nestedArgs?: boolean,
    selectedCardAmount?: number,
    selectablePositions?: {
        self: string[],
        opponent: string[],
        allowCrossTarget: boolean,
        targetAmount: number
    };
}

export interface IAbility {
    cardId: string;
    cardHolderId?: string;
    description: string;
    type: string;
    usageType: string;
    subtype: string;
    requirements?: AbilityRequirements;
    targetPositions?: {
        self: string[],
        opponent: string[]
    },
    targetCards?: string[];
    nestedArgs?: RequirementArgs;
}

export interface CostModifierAbility extends IAbility {
    deploy: number;
    action: number;
    passive: number;
}

export interface AttributeModifierAbility extends IAbility {
    attack: number;
    defence: number;
}

export interface InstantAbility extends IAbility {
    name: string;
    args?: object | string;
}

enum Deck {
    light = "light",
    darkness = "darkness",
    venom = "venom"
}

export interface ICard {
    id: string;
    tempId?: string;
    name: string;
    deck: Deck;
    cost: number;
    attack: number;
    defence: number;
    pieces: number;
    actionAbility: IAbility;
    passiveAbility: IAbility;
}

/*---Match Interfaces---*/

export interface IDeployedCard {
    [WarTrackPos.defender]?: ICard;
    [WarTrackPos.supporter]?: ICard;
    [WarTrackPos.attacker]?: ICard;
    [WarTrackPos.stormer]?: ICard;
    [WarTrackPos.frontLiner]?: ICard;
    [WarTrackPos.vanguard]?: ICard;
}


export interface IPlayerState {
    userId?: string;
    deck: Deck;
    drawingDeck: string[];
    bonusHealth: number[];
    casualties: string[];
    onHand: string[];
    mana: number;
    manaCards: string[];
    deployedCards: IDeployedCard;
    timeLeft?: number;
    turnStartedAt?: number;
    turnStage: number;
    drawsPerTurn: number;
}

export interface IBattle {
    timeLimit?: number;
    playerStates: Record<string, IPlayerState>;
    turnOfPlayer: string;
    abilities: {
      activatedAbilities: IAbility[];
    };
    turn: number;
}

export enum MatchStage {
    pending = "pending",
    preparing = "preparing",
    started = "started",
    finished = "finished",
    abandoned = "abandoned"
}

export interface IMatch {
    key: string;
    player1Id: string;
    player2Id: string;
    battle: IBattle;
    randomMatch: boolean;
    stage: MatchStage;
}

/*---User Interfaces---*/

export interface IUser {
    userId: string;
    username: string;
    picture: string;
    friends: string[];
    requests: IFriendRequest[];
}

export interface IUserResponseBody {
    user: IUser;
    friends: IFriend[];
}