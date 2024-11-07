import Frame from "./Frame.tsx";
import {IconButton} from "./Button.tsx";
import {FC, ReactNode} from "react";

const Modal: FC<{ children: ReactNode, close: () => void }> = ({ children, close }) => {

    return (
        <div className="modal" >
            <Frame>
                <IconButton text="" icon="cancel" onClick={close} />
                {children}
            </Frame>
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

export default Modal;