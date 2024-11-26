import Modal from "./Modal.tsx";
import {Button} from "./Button.tsx";
import {FC, ReactElement, useContext} from "react";
import {AuthContext, ModalContext} from "../Context.tsx";

const AuthRequiredDialog: FC<{ modalToBeOpened: ReactElement | undefined }> = ({ modalToBeOpened }) => {

    const { login } = useContext(AuthContext);
    const { openModal } = useContext(ModalContext);

    const customLogin = () => {
        login().then(() => {
            if (modalToBeOpened) {
                openModal(modalToBeOpened);
            }
        });
    }

    return(
        <Modal>
            <div className="p-4 flex flex-col items-center">
                <p className="p-4 w-1 min-w-full text-center" >
                    Please log in if you already have an account or register to create a new one
                </p>
                <div className="flex gap-4" >
                    <Button text="Log In" onClick={customLogin} />
                    <Button text="Register" onClick={customLogin} />
                </div>
            </div>
        </Modal>
    );
}

export default AuthRequiredDialog;