import {FC} from "react";
import avatars from "../assets/avatars/avatars.ts";
import styles from "../styles/components/AvatarDisplay.module.css";

const AvatarDisplay: FC<{ avatar?: string }> = ({ avatar }) => {

    const src = avatar && avatar in avatars ?
        avatars[avatar]
        :
        Object.values(avatars)[0];

    return <img
        className={styles.avatarDisplay}
        src={src}
        alt={""}
    />
}

export default AvatarDisplay;