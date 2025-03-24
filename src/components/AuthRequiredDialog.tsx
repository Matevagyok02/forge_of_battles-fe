import Modal from "./Modal.tsx";
import {Button} from "./Button.tsx";
import {FC, ReactElement, useContext, useEffect} from "react";
import {AuthContext, ModalContext} from "../context.tsx";

const AuthRequiredDialog: FC<{ modalToBeOpened: ReactElement | undefined }> = ({ modalToBeOpened }) => {

    const { login, isAuthenticated } = useContext(AuthContext);
    const { openModal } = useContext(ModalContext);

    useEffect(() => {
        if (isAuthenticated && modalToBeOpened) {
            openModal(modalToBeOpened);
        }
    }, [isAuthenticated]);

    return(
        <Modal>
            <div className="p-4 flex flex-col items-center">
                <p className="p-4 w-1 min-w-full text-center" >
                    Please log in if you already have an account or register to create a new one
                </p>
                <div className="flex gap-4" >
                    <Button text={"Log In"} onClick={login} />
                    <Button text={"Register"} onClick={login} />
                </div>
            </div>
        </Modal>
    );
}

export default AuthRequiredDialog;