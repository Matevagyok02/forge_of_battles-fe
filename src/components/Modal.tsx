import {Frame} from "./Frame.tsx";
import {Button, Icon, IconButton} from "./Button.tsx";
import {FC, ReactElement, ReactNode, useContext, useEffect} from "react";
import {ModalContext} from "../context.tsx";
import styles from "../styles/components/Modals.module.css";

const Modal: FC<{ children: ReactNode, canBeClosed?: boolean }> = ({ children, canBeClosed = true}) => {

    const {closeModal} = useContext(ModalContext)

    useEffect(() => {
        const handleKeyDown = (e: any) => {
            if (e.key === "Escape" && canBeClosed) {
                closeModal();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [canBeClosed]);

    return (
        <div className={styles.regularModal} >
            <Frame bg={true} >
                { canBeClosed &&
                    <div className={styles.closeButton} >
                        <IconButton icon={Icon.cancel} onClick={closeModal} />
                    </div>
                }
                {children}
            </Frame>
        </div>
    );
}

export const ForcedModal: FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <div className={styles.forcedModal} >
            <Frame bg={true} >
                {children}
            </Frame>
        </div>
    );
}

export interface IInfoModal {
    content: ReactElement;
    onOk?: (args?: any) => void;
}

export const InfoModal: FC<{
    children: ReactNode,
    close: () => void,
    onOk?: (args?: any) => void
}> = ({ children, close, onOk }) => {

    const closeModal = () => {
        if (onOk) {
            onOk();
        }
        close();
    }

    return(
        <div className={styles.infoModal} >
            <Frame bg={true} >
                <div className={styles.content} >
                    {children}
                    <horizontal-line/>
                    <Button text={"Ok"} onClick={closeModal} />
                </div>
            </Frame>
        </div>
    )
}

export default Modal;