import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import {ReactElement, useCallback, useState} from "react";
import {IInfoModal, InfoModal} from "./components/Modal.tsx";
import {AuthContext, BgMusicContext, FriendsContext, ModalContext, UserContext} from "./context.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {IUser} from "./interfaces.ts";
import {Friends, IFriend} from "./pages/home/friends_panel/FriendsPanel.tsx";
import Preparation from "./pages/preparation/Preparation.tsx";
import Battle from "./pages/battle/Battle.tsx";
import Join from "./pages/join/Join.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import AddCard from "./pages/add_card/AddCard.tsx";
import {useAuthInterceptor} from "./api/interceptorHooks.tsx";
import DecksAndCards from "./pages/decks_and_cards/DecksAndCards.tsx";
import Rules from "./pages/rules/Rules.tsx";
import {BackgroundMusicPlayer, AutoMusicController, loadMusicVolume} from "./components/BgMusic.tsx";
import {useIsServerAvailable} from "./api/hooks.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";
import ServerUnavailableScreenBlock from "./components/ServerUnavailableScreenBlock.tsx";

const App = () => {
    useAuthInterceptor();

    const [_user, setUser] = useState<IUser>();
    const [friends, setFriends] = useState<Friends>({friends: [], pending: []});

    const isServerAvailable= useIsServerAvailable();

    const [openedInfoModal, setOpenedInfoModal] = useState<IInfoModal[]>([]);
    const [openedModal, setOpenedModal] = useState<ReactElement | null>(null);
    const [openedForcedModal, setOpenedForcedModal] = useState<ReactElement | null>(null);

    const [musicVolume, setMusicVolume] = useState<number>(loadMusicVolume());

    const { user, isAuthenticated, logout, loginWithPopup, isLoading } = useAuth0();

    const getFriendById = useCallback((id: string): IFriend | undefined => {
        return friends.friends.find(friend => friend.userId === id);
    }, [friends.friends]);

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

    const openInfoModal = (content: ReactElement, func?: (args: any) => void) => {
        const infoModal: IInfoModal = {content, onOk: func};

        setOpenedInfoModal(prevState => {
            if (prevState.findIndex(modal => modal.content.key === content.key) === -1) {
                return [...prevState, infoModal];
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

    if (isServerAvailable.isLoading) {
        if (isServerAvailable.failureCount > 0)
            return <ServerUnavailableScreenBlock />;
        else
            return <LoadingScreen />;
    } else return(
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: isAuthenticated && !isLoading,
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
                <BgMusicContext.Provider value={{ musicVolume, setMusicVolume }} >
                    <BackgroundMusicPlayer />
                    <UserContext.Provider value={{_user, setUser}}>
                        <FriendsContext.Provider value={{friends, setFriends, getFriendById}}>
                            <BrowserRouter>
                                <AutoMusicController />
                                {openedInfoModal.map((infoModal, index) => (
                                    <InfoModal close={() => closeInfoModal(index)} onOk={infoModal.onOk} key={index} >
                                        {infoModal.content}
                                    </InfoModal>
                                ))}
                                {
                                    openedForcedModal &&
                                    openedForcedModal
                                }
                                <Routes>
                                    <Route path="/" element={<Home/>} />
                                    <Route path="/preparation/:key" element={<Preparation/>} />
                                    <Route path="/battle/:key" element={<Battle/>} />
                                    <Route path="/join/:key" element={<Join/>} />
                                    <Route path="/add-card" element={<AdminRoute element={<AddCard/>} />} />
                                    <Route path="/decks-and-cards" element={<DecksAndCards/>} />
                                    <Route path="/rules" element={<Rules/>} />
                                </Routes>
                            </BrowserRouter>
                        </FriendsContext.Provider>
                    </UserContext.Provider>
                </BgMusicContext.Provider>
            </ModalContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;