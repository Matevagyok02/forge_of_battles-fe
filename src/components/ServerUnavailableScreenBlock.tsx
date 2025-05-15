import {FC} from "react";
import styles from "../styles/components/ServerUnavailableScreenBlock.module.css";
import {Frame} from "./Frame.tsx";

const ServerUnavailableScreenBlock: FC = () => {

    return (
        <div className={styles.blocker} >
            <Frame>
                <div className={styles.content} >
                    <h1 className={'animate-pulse'} >
                        ⚠️
                    </h1>
                    <p className={'animate-pulse'} >
                        The server is currently waking up. It should be available shortly — please hang tight!
                    </p>
                </div>
            </Frame>
        </div>
    );
}

export default ServerUnavailableScreenBlock;