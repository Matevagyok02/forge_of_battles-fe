import {FC, useEffect, useState} from "react";
import "./Hud.css";

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
        <div className={`hud`} style={{ transform: `scale(${scale})` }} >
            <div className="hud-inner-container" >
                <div className="mana-pool-container" >
                    <div className="mana-pool" >
                        {manaShards.map((mana, index) =>
                            <div
                                key={index}
                                className={`mana-shard ${typeof mana === "boolean" ? mana ? "active" : "used" : ""}`}
                            ></div>
                        )}
                    </div>
                    <div className="mana-pool-decor" ></div>
                </div>
                <div className="health-container" >
                    <div className="health-decor" ></div>
                    <div
                        className="health"
                        data-health={health}
                        style={{ backgroundImage: `linear-gradient(-45deg, var(--crimson), var(--dark-grey) ${calcHealthPercentage(health)}%`}}
                    >
                        <h1>
                            {health}
                        </h1>
                    </div>
                </div>
                <div className="avatar-container" >
                    <img src={`../avatars/${avatar || "1"}.jpg`} alt="" />
                </div>
                <div className="username-container" >
                    <h1>
                        {username}
                    </h1>
                </div>
                { timeLeft &&
                    <div className="time-container" >
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