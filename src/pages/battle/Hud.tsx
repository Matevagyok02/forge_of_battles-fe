import {FC, useContext, useEffect, useState} from "react";
import styles from "./Hud.module.css";
import {IPlayerState, IUser} from "../../interfaces.ts";
import {findPlayerById} from "../../api/user.ts";
import {AuthContext, MatchContext, UserContext} from "../../Context.tsx";

const maxMana = 10;
const maxHealth = 8;

const HudContainer: FC = () => {

    const { player, opponent, socket } = useContext(MatchContext);
    const { _user } = useContext(UserContext);

    return( opponent && player &&
        <div className="hud-container" >
            <Hud
                playerState={opponent}
            />
            <Hud
                playerState={player}
                username={_user?.username}
                picture={_user?.picture}
            />
        </div>
    )
}

const Hud: FC<{
    playerState: IPlayerState,
    username?: string,
    picture?: string
}> = ({ playerState, username, picture }) => {

    const [userDetails, setUserDetails] = useState<{username: string, picture: string}>();
    const [timeLeft, setTimeLeft] = useState<number | undefined>(playerState.timeLeft);
    const [countownInterval, setCountdownInterval] = useState<number>();

    const userId = useContext(AuthContext).user?.sub;
    const { setUser } = useContext(UserContext);

    useEffect(() => {
        let intervalId: number | undefined;

        const countdown = () => {
            setTimeLeft(playerState?.timeLeft - (Date.now() - playerState?.turnStartedAt));
        };

        if (playerState.turnStage > 0 && playerState.timeLeft > 0) {
            intervalId = window.setInterval(countdown, 1000);
        } else {
            setTimeLeft(playerState.timeLeft);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [playerState.turnStage, playerState.timeLeft, playerState.turnStartedAt]);

    useEffect(() => {
        if (timeLeft === 0 && countownInterval) {
            clearInterval(countownInterval);
            setCountdownInterval(undefined);
            //TODO: socket.emit("endTurn", { playerId: playerState.userId });
        }
    }, [timeLeft]);

    useEffect(() => {
        if (playerState.turnStage === 0 && playerState.timeLeft > 0) {
            setTimeLeft(playerState.timeLeft);
        }
    }, [playerState.turnStage, playerState.timeLeft]);

    useEffect(() => {
        if (username && picture) {
            setUserDetails({
                username,
                picture
            });
        } else if (playerState.userId) {
            findPlayerById(playerState.userId).then(response => {
                if (response?.ok && response?.body) {
                    const user = response.body as IUser

                    if (user.userId === userId) {
                        setUser(user);
                    }

                    setUserDetails({
                        username: user.username,
                        picture: user.picture
                    })
                }
            });
        }
    }, [playerState.userId]);

    const getMana = () => {
        const mana: (boolean | null)[] = [];

        for (let i = 0; i < maxMana; i++) {
            if (playerState.manaCards[i]) {
                mana.push(playerState.mana - 1 >= i);
            } else {
                mana.push(null);
            }
        }

        return mana;
    }

    const calcHealthPercentage = (health: number) => {
        if (health === maxHealth)
            return 150;

        const x = health > 0 ? (maxHealth - health) / 3 : 0;
        return health / maxHealth * 100 + x;
    }

    const calcTimeLeft = (time: number) => {
        const timeInSeconds = time / 1000;
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }

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
                <div>
                    <div className={styles.manaPool} >
                        { playerState && getMana().map((mana, index) =>
                            <div
                                key={index}
                                className={`${styles.manaShard} ${typeof mana === "boolean" ? mana ? styles.active : styles.used : ""}`}
                            ></div>
                        )}
                    </div>
                    <div className={styles.manaPoolDecor} ></div>
                </div>
                <div className={styles.healthContainer} >
                    <div className={styles.healthDecor} ></div>
                    <div
                        className={styles.health}
                        data-health={playerState.drawingDeck.length}
                        style={{ backgroundImage: `linear-gradient(-45deg, var(--crimson), var(--dark-grey) ${calcHealthPercentage(playerState.drawingDeck.length)}%`}}
                    >
                        <h1>
                            {playerState.drawingDeck.length}
                        </h1>
                    </div>
                </div>
                <div className={styles.avatarContainer} >
                    <img src={`../avatars/${userDetails?.picture || "1"}.jpg`} alt="" />
                </div>
                <div className={styles.usernameContainer} >
                    <h1>
                        {userDetails?.username}
                    </h1>
                </div>
                { playerState.timeLeft &&
                    <div className={styles.timeContainer} >
                        <h1>
                            { timeLeft && playerState.turnStage > 0  ?
                                calcTimeLeft(timeLeft)
                                :
                                calcTimeLeft(playerState.timeLeft)
                            }
                        </h1>
                    </div>
                }
            </div>
        </div>
    )
}

export default HudContainer;