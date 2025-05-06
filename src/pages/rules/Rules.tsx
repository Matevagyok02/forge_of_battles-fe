import {FC, useState} from "react";
import styles from "../../styles/rules_page/Rules.module.css";
import {Frame} from "../../components/Frame.tsx";
import {Icon, IconButton} from "../../components/Button.tsx";
import {useNavigate} from "react-router-dom";
import Overview from "./themes/Overview.tsx";
import TurnSequence from "./themes/TurnSequence.tsx";
import {CardPilesAndHand, HUD, Battlefield} from "./themes/GameComponents.tsx";
import CardAnatomy from "./themes/CardAnatomy.tsx";
import {MusicVolumeControl} from "../../components/BgMusic.tsx";

const themes = [
    { title: "What is Forge of Battles?", content: <Overview /> },
    { title: "Card Anatomy", content: <CardAnatomy /> },
    { title: "Turn Sequence", content: <TurnSequence /> },
    { title: "Card Piles & Hand", content: <CardPilesAndHand /> },
    { title: "HUD", content: <HUD/> },
    { title: "Battlefield", content: <Battlefield /> }
]

const Rules: FC = () => {

    const navigate = useNavigate();
    const [themeIndex, setThemeIndex] = useState(0);

    const prevTheme = () => {
        setThemeIndex(prev => {
            if (prev < 1)
                return 0;
            else
                return prev - 1;
        });
    }

    const nextTheme = () => {
        setThemeIndex(prev => {
            if (prev >= themes.length - 1)
                return themes.length - 1;
            else
                return prev + 1;
        });
    }

    return (
        <main className={styles.rules} >
            <menu>
                <IconButton icon={Icon.left} text={"Home"} showText onClick={() => navigate("/")} />
                <MusicVolumeControl />
            </menu>
            <Frame bg >
                <div className={styles.container} >
                    <h1 className={styles.title} >
                        {themes[themeIndex].title}
                    </h1>
                    <div className={styles.content} >
                        {themes[themeIndex].content}
                    </div>
                    <div className={styles.themeSelect} >
                        <IconButton icon={Icon.left} text={"Previous"} onClick={prevTheme} />
                        <ul>
                            {themes.map((_, index) => (
                                <li
                                    key={index}
                                    data-value={themeIndex === index}
                                >
                                </li>
                            ))}
                        </ul>
                        <IconButton icon={Icon.right} text={"Next"} onClick={nextTheme} />
                    </div>
                </div>
            </Frame>
        </main>
    );
}

export default Rules;