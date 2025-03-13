import {FC} from "react";
import styles from "./LoadingScreen.module.css";

const LoadingScreen: FC<{ loading?: boolean }> = ({ loading }) => {

  return ( loading &&
      <div className={styles.overlay} ></div>
  );
}

export default LoadingScreen;