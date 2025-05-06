import {ChangeEvent, FC, useContext, useEffect, useRef, useState} from "react";
import bgmusic from "../assets/audio/bgmusic.mp3";
import {Icon, IconButton} from "./Button.tsx";
import {BgMusicContext} from "../context.tsx";
import styles from "../styles/components/VolumeControl.module.css";
import {useLocation} from "react-router-dom";

const sources: string[] = [
    bgmusic
];

const DELAY = 5000;

const DEFAULT_VOLUME = 0.5;

const generateMusicQueue = () => {
    return [...sources].sort(() => Math.random() - 0.5);
};

const saveMusicVolume = (volume: number) => {
    localStorage.setItem("musicVolume", volume.toString());
}

export const loadMusicVolume = () => {
    const volume = localStorage.getItem("musicVolume");
    return volume ? parseFloat(volume) : DEFAULT_VOLUME;
}

export const MusicVolumeControl: FC<{ expandUpward?: boolean }> = ({ expandUpward }) => {

    const [expand, setExpand] = useState(false);
    const { musicVolume, setMusicVolume } = useContext(BgMusicContext);

    const setVolume = (e: ChangeEvent<HTMLInputElement>) => {
        const parsedVolume = parseFloat(e.target.value);
        setMusicVolume(parsedVolume);
        saveMusicVolume(parsedVolume);
    }

    return ( expand ?
            <button className={styles.volumeControl} onMouseLeave={() => setExpand(false)} >
                <div className={expandUpward ? styles.up : ""} >
                    <input
                        dir={"rtl"}
                        type={"range"}
                        aria-orientation={"vertical"}
                        min={0}
                        max={1}
                        step={0.01}
                        value={musicVolume}
                        onChange={setVolume}
                        className="w-full"
                    />
                </div>
            </button>
            :
            <IconButton bg icon={Icon.music} deactivated={musicVolume === 0} decorated onClick={() => setExpand(true)} />
    );
}

export const BackgroundMusicPlayer: FC = () => {

    const { musicVolume } = useContext(BgMusicContext);

    const audioContextRef = useRef<null | AudioContext>(null);
    const gainNodeRef = useRef<null | GainNode>(null);
    const currentSourceRef = useRef<null | AudioBufferSourceNode>(null);
    const trackQueueRef = useRef<string[]>([]);

    const [canStartPlaying, setCanStartPlaying] = useState(false);

    useEffect(() => {
        const start = () => setCanStartPlaying(true);

        window.addEventListener('keydown', start, { once: true });
        window.addEventListener('touchstart', start, { once: true });
        window.addEventListener('click', start, { once: true });

        return () => {
            window.removeEventListener('keydown', start);
            window.removeEventListener('touchstart', start);
            window.removeEventListener('click', start);
        };
    }, []);

    const playNext = async () => {
        if (trackQueueRef.current.length === 0) {
            trackQueueRef.current = generateMusicQueue();
        }

        const nextTrack = trackQueueRef.current.shift();
        const response = await fetch(nextTrack!);
        const buffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(buffer);

        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        gainNodeRef.current!.gain.value = musicVolume;
        source.connect(gainNodeRef.current!);
        source.start();

        currentSourceRef.current = source;

        source.onended = () => {
            currentSourceRef.current = null;
            setTimeout(() => playNext(), DELAY);
        };
    };

    useEffect(() => {
        if (canStartPlaying) {
            audioContextRef.current = new AudioContext();
            gainNodeRef.current = audioContextRef.current!.createGain();
            gainNodeRef.current!.connect(audioContextRef.current!.destination);

            playNext();
        }

        return () => {
            currentSourceRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, [canStartPlaying]);

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current!.gain.value = musicVolume;
        }
    }, [musicVolume]);

    return <></>;
};

export const AutoMusicController: FC = () => {
    const { setMusicVolume } = useContext(BgMusicContext);
    const location = useLocation();

    const disabledPaths = [
        "/add-card",
        "/join",
        "/preparation",
    ];

    useEffect(() => {
        if (disabledPaths.includes(location.pathname)) {
            setMusicVolume(0);
        } else {
            setMusicVolume(loadMusicVolume());
        }
    }, [location]);

    return <></>;
}