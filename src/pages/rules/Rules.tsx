import {FC, useState} from "react";
import styles from "../../styles/rules_page/Rules.module.css";
import {Frame} from "../../components/Frame.tsx";
import {Icon, IconButton} from "../../components/Button.tsx";
import {useNavigate} from "react-router-dom";
import Overview from "../../styles/rules_page/themes/Overview.tsx";
import TurnSequence from "../../styles/rules_page/themes/TurnSequence.tsx";

const themes = [
    { title: "What is Forge of Battles?", content: <Overview /> },
    { title: "Game Components", content: <p></p> },
    { title: "Card Anatomy", content: <p></p> },
    { title: "Turn Sequence", content: <TurnSequence/> },
    { title: "How to Play Cards", content: <p></p> },
    { title: "Engagement Options", content: <p></p> }
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
            <span className={styles.backBtn} >
                <IconButton icon={Icon.left} text={"Home"} showText onClick={() => navigate("/")} />
            </span>
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
                            {themes.map((theme, index) => (
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