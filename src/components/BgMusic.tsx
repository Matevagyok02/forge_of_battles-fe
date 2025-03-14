import { FC, useEffect } from "react";
import bgmusic from "../assets/audio/bgmusic.mp3";

const BgMusic: FC = () => {
    useEffect(() => {
        const audio = new Audio(bgmusic);
        audio.loop = true;
        audio.volume = 0.25;
        audio.play();

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    return null;
};

export default BgMusic;