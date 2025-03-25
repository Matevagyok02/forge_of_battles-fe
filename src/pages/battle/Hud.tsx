import {FC, useCallback, useContext, useEffect, useState} from "react";
import styles from "./Hud.module.css";
import {IPlayerState, IUser} from "../../interfaces.ts";
import {findPlayerById} from "../../api/user.ts";
import {AuthContext, MatchContext, UserContext} from "../../context.tsx";
import {OutgoingBattleEvent} from "./Battle.tsx";

const maxMana = 10;
const maxHealth = 8;
export const criticalTime = 30000; //secons

export const calcTimeLeft = (time: number) => {
    const timeInSeconds = time / 1000 > 0 ? time / 1000 : 0;
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

const HudContainer: FC = () => {

    const { player, opponent } = useContext(MatchContext);

    return( opponent && player &&
        <div className="hud-container" >
            <Hud
                playerState={opponent}
            />
            <Hud
                playerState={player}
            />
        </div>
    )
}

const Hud: FC<{ playerState: IPlayerState }> = ({ playerState}) => {

    const calcScale = (screenWidth: number) => {
        return screenWidth / 1800;
    }

    const [scale, setScale] = useState<number>(calcScale(window.innerWidth));

    useEffect(() => {
        const handleResize = () => {
            setScale(calcScale(window.innerWidth));
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return(
        <div className={styles.hud} style={{ transform: `scale(${scale})` }} >
            <div className={styles.hudInnerContainer} >
                <ManaPool
                    activeMana={playerState.mana}
                    allMana={playerState.manaCards.length}
                />
                <Health
                    baseHealth={playerState.drawingDeck.length}
                    bonusHealth={playerState.bonusHealth.length}
                />
                < PlayerDetails
                    playerId={playerState.userId}
                />
                { playerState.timeLeft &&
                    <TimeLeftDisplay
                        turnStartedAt={playerState.turnStartedAt}
                        prevTimeLeft={playerState.timeLeft}
                        shouldCountdown={playerState.turnStage > 0}
                    />
                }
            </div>
        </div>
    )
}

enum Mana {
    empty,
    used,
    active
}

const ManaPool: FC<{ activeMana: number, allMana: number }> = ({ activeMana, allMana }) => {

    const [prevMana, setPrevMana] = useState<Mana[]>([]);
    const [mana, setMana] = useState<Mana[]>([]);

    useEffect(() => {
        setPrevMana(mana);
        const newMana: Mana[] = [];

        for (let i = 0; i < maxMana; i++) {
            newMana.push(i < allMana ? (i < activeMana ? Mana.active : Mana.used) : Mana.empty);
        }

        setMana(newMana);
    }, [activeMana, allMana]);

    const getClasses = (prev: Mana, current: Mana) => {
        const getTypeClass = () => {
            switch (current) {
                case Mana.empty:
                    return styles.empty;
                case Mana.used:
                    return styles.used;
                case Mana.active:
                    return styles.active;
                default:
                    return "";
            }
        }

        const getTransitionClass = () => {
            switch (current) {
                case Mana.empty: {
                    switch (prev) {
                        case Mana.used:
                            return styles.usedToEmpty;
                        case Mana.active:
                            return styles.activeToEmpty;
                        default:
                            return "";
                    }
                }
                case Mana.active: {
                    switch (prev) {
                        case Mana.empty:
                            return styles.emptyToActive;
                        case Mana.used:
                            return styles.usedToActive;
                        default:
                            return "";
                    }
                }
                case Mana.used: {
                    switch (prev) {
                        case Mana.active:
                            return styles.activeToUsed;
                        default:
                            return "";
                    }
                }
            }
        }

        return `${styles.manaShard} ${getTypeClass()} ${getTransitionClass()}`;
    }

    return(
        <div>
            <div className={styles.manaPool} >
                { mana.map((mana, index) =>
                    <div
                        key={index}
                        className={getClasses(prevMana[index], mana)}
                    ></div>
                )}
            </div>
            <div className={styles.manaPoolDecor} ></div>
        </div>
    );
}

const Health: FC<{ baseHealth: number, bonusHealth: number }> = ({ baseHealth, bonusHealth }) => {

    const [health, setHealth] = useState<number>(baseHealth + bonusHealth);

    useEffect(() => {
        setHealth(baseHealth + bonusHealth);
    }, [baseHealth, bonusHealth]);

    const calcHealthPercentage = (health: number) => {
        if (health === maxHealth)
            return 150;

        const x = health > 0 ? (maxHealth - health) / 3 : 0;
        return health / maxHealth * 100 + x;
    }

    return(
        <div className={styles.healthContainer} >
            <div className={styles.healthDecor} ></div>
            <div
                className={styles.health}
                data-health={health}
                style={{ backgroundImage: `linear-gradient(-45deg, var(--crimson), var(--dark-grey) ${calcHealthPercentage(health)}%`}}
            >
                <h1>
                    {health}
                </h1>
            </div>
        </div>
    );
}

const TimeLeftDisplay: FC<{ turnStartedAt?: number, prevTimeLeft: number, shouldCountdown: boolean }> = ({ turnStartedAt, prevTimeLeft, shouldCountdown }) => {

    const { socket } = useContext(MatchContext);
    const [timeLeft, setTimeLeft] = useState<number | undefined>(prevTimeLeft);
    const [countownInterval, setCountdownInterval] = useState<number>();

    useEffect(() => {
        let intervalId: number | undefined;

        if (turnStartedAt) {
            const countdown = () => {
                setTimeLeft(prevTimeLeft - (Date.now() - turnStartedAt));
            };

            if (shouldCountdown && prevTimeLeft > 0) {
                intervalId = window.setInterval(countdown, 1000);
                setCountdownInterval(intervalId);
            } else {
                setTimeLeft(prevTimeLeft);
            }
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [shouldCountdown, prevTimeLeft, turnStartedAt]);

    useEffect(() => {
        if (timeLeft && timeLeft < 1000 && countownInterval) {
            clearInterval(countownInterval);
            setCountdownInterval(undefined);
            endTurn();
        }
    }, [timeLeft]);

    const endTurn = useCallback(() => {
        if (socket) {
            socket.emit(OutgoingBattleEvent.endTurn);
        }
    }, [socket]);

    useEffect(() => {
        if (!shouldCountdown && prevTimeLeft > 0) {
            setTimeLeft(prevTimeLeft);
        }
    }, [shouldCountdown, prevTimeLeft]);

    return(
        <div className={styles.timeContainer} >
            <h1 className={timeLeft && timeLeft <= criticalTime || prevTimeLeft <= criticalTime ? "text-red-700" : ""} >
                { timeLeft && shouldCountdown  ?
                    calcTimeLeft(timeLeft)
                    :
                    calcTimeLeft(prevTimeLeft)
                }
            </h1>
        </div>
    );
}

const PlayerDetails: FC<{ playerId?: string }> = ({ playerId }) => {

    const [userDetails, setUserDetails] = useState<{username: string, picture: string}>();

    const userId = useContext(AuthContext).user?.sub;
    const { _user } = useContext(UserContext);
    const { setUser } = useContext(UserContext);

    useEffect(() => {
        if (_user && _user.username && _user.picture && _user.userId === userId) {
            setUserDetails({
                username: _user.username,
                picture: _user.picture
            });
        } else if (playerId) {
            findPlayerById(playerId).then(response => {
                if (response?.ok && response?.body) {
                    const playerDetails = response.body as IUser

                    if (playerDetails.userId === userId) {
                        setUser(playerDetails);
                    }

                    setUserDetails({
                        username: playerDetails.username,
                        picture: playerDetails.picture
                    })
                }
            });
        }
    }, [userId]);

    return(
        <>
            <div className={styles.avatarContainer} >
                <img src={`../avatars/${userDetails?.picture || "1"}.jpg`} alt="" />
            </div>
            <div className={styles.usernameContainer} >
                <h1>
                    {userDetails?.username}
                </h1>
            </div>
        </>
    );
}

export default HudContainer;