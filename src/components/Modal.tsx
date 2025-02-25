import Frame from "./Frame.tsx";
import {Button, Icon, IconButton} from "./Button.tsx";
import {FC, ReactElement, ReactNode, useContext, useEffect} from "react";
import {ModalContext} from "../Context.tsx";

const Modal: FC<{ children: ReactNode, closeCondition?: boolean }> = ({ children, closeCondition = true}) => {

    const {closeModal} = useContext(ModalContext)

    useEffect(() => {
        const handleKeyDown = (e: any) => {
            if (e.key === "Escape" && closeCondition) {
                closeModal();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    return (
        <div className="modal-container" >
            <div className="modal" >
                <Frame>
                    { closeCondition &&
                        <IconButton icon={Icon.cancel} onClick={closeModal} />
                    }
                    {children}
                </Frame>
            </div>
        </div>
    );
}

export const ForcedModal: FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <div className="modal forced" >
            <Frame>
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
        <div className="modal-container info" >
            <div className="modal" >
                <Frame>
                    <div className="flex flex-col gap-4 items-center p-4" >
                        {children}
                        <div className="hr" ></div>
                        <Button text="Ok" onClick={closeModal} />
                    </div>
                </Frame>
            </div>
        </div>
    )
}

export default Modal;