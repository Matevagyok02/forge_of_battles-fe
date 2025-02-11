import {FC, useEffect, useState} from "react";
import styles from "./Hud.module.css";

const maxHealth = 34;

const Hud: FC = () => {

    const initMana = () => {
        let mana = [];
        for(let i = 0; i < 10; i++){
            if (i < 4)
                mana.push(true);
            else if (i < 7)
                mana.push(false);
            else
                mana.push(undefined);
        }
        return mana
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

    const [manaShards, setManaShards] = useState<(boolean | undefined)[]>(initMana());
    const [health, setHealth] = useState<number>(34);
    const [timeLeft, setTimeLeft] = useState<number>(654321);
    const [avatar, setAvatar] = useState<string>("1");
    const username = "Matevagyok2002";

    useEffect(() => {
        //TODO: Dele this useEffect
        setManaShards(initMana());
        setHealth(34);
        setTimeLeft(654321);
        setAvatar("1");
    }, []);

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
                        {manaShards.map((mana, index) =>
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
                        data-health={health}
                        style={{ backgroundImage: `linear-gradient(-45deg, var(--crimson), var(--dark-grey) ${calcHealthPercentage(health)}%`}}
                    >
                        <h1>
                            {health}
                        </h1>
                    </div>
                </div>
                <div className={styles.avatarContainer} >
                    <img src={`../avatars/${avatar || "1"}.jpg`} alt="" />
                </div>
                <div className={styles.usernameContainer} >
                    <h1>
                        {username}
                    </h1>
                </div>
                { timeLeft &&
                    <div className={styles.timeContainer} >
                        <h1>
                            {calcTimeLeft(timeLeft)}
                        </h1>
                    </div>
                }
            </div>
        </div>
    )
}

export default Hud;