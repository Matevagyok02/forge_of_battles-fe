import Frame from "./Frame.tsx";
import {Button, IconButton} from "./Button.tsx";
import {FC, ReactNode} from "react";

const Modal: FC<{ children: ReactNode, close: () => void }> = ({ children, close }) => {

    return (
        <div className="modal-container" >
            <div className="modal" >
                <Frame>
                    <IconButton text="" icon="cancel" onClick={close} />
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

export const InfoModal: FC<{ children: ReactNode, close: () => void }> = ({ children, close }) => {

    return(
        <div className="modal-container info" >
            <div className="modal" >
                <Frame>
                    <div className="flex flex-col gap-4 items-center p-4" >
                        {children}
                        <div className="hr" ></div>
                        <Button text="Ok" onClick={close} />
                    </div>
                </Frame>
            </div>
        </div>
    )
}

export default Modal;