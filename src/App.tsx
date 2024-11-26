import './styles/App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import WindowFrame from "./components/WindowFrame.tsx";
import {ReactElement, useState} from "react";
import {InfoModal} from "./components/Modal.tsx";
import {AuthContext, FriendsContext, ModalContext, UserContext} from "./Context.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {IUser} from "./interfaces.ts";
import {Friends} from "./pages/home/FriendsPanel.tsx";

const App = () => {

    const [_user, setUser] = useState<IUser>();
    const [friends, setFriends] = useState<Friends>({friends: [], pending: []});

    const [openedInfoModal, setOpenedInfoModal] = useState<ReactElement[]>([]);
    const [openedModal, setOpenedModal] = useState<ReactElement | null>(null);
    const [openedForcedModal, setOpenedForcedModal] = useState<ReactElement | null>(null);

    const { user, isAuthenticated, logout, loginWithPopup } = useAuth0();

    const openModal = (modal: ReactElement) => {
        setOpenedModal(modal);
    }

    const closeModal = () => {
        setOpenedModal(null);
    }

    const openForcedModal = (modal: ReactElement) => {
        setOpenedForcedModal(modal);
    }

    const closeForcedModal = () => {
        setOpenedForcedModal(null);
    }

    const closeInfoModal = (index: number) => {
        setOpenedInfoModal(prevState => prevState.filter((_, i) => i !== index));
    }

    const openInfoModal = (content: ReactElement) => {
        setOpenedInfoModal(prevState => {
            if (prevState.findIndex(modal => modal.key === content.key) === -1) {
                return [...prevState, content];
            } else {
                return prevState;
            }
        });
    }

    const customLogout = async () => {
        await logout({logoutParams: {returnTo: window.location.origin }});
    }

    const customLogin = async () => {
        await loginWithPopup();
    }

    return(
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login: customLogin,
                logout: customLogout
        }}
        >
            <ModalContext.Provider
                value={{
                    openInfoModal,
                    closeInfoModal,
                    openedModal,
                    openModal,
                    closeModal,
                    openedForcedModal,
                    openForcedModal,
                    closeForcedModal
                }}
            >
                <UserContext.Provider value={{_user, setUser}}>
                    <FriendsContext.Provider value={{friends, setFriends}}>
                        <WindowFrame>

                            {openedInfoModal.map((content, index) => (
                                <InfoModal close={() => closeInfoModal(index)} key={index} >
                                    {content}
                                </InfoModal>
                            ))}

                            {
                                openedForcedModal &&
                                openedForcedModal
                            }

                            <BrowserRouter>
                                <Routes>
                                    <Route path="/" element={<Home/>} />
                                    <Route path="/battle" element={null} />
                                </Routes>
                            </BrowserRouter>

                        </WindowFrame>
                    </FriendsContext.Provider>
                </UserContext.Provider>
            </ModalContext.Provider>
        </AuthContext.Provider>
    )
}

export default App;