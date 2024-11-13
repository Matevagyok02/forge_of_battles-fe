import './styles/App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import WindowFrame from "./components/WindowFrame.tsx";

const App = () => {

    return(
        <WindowFrame>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/battle" element={null} />
                </Routes>
            </BrowserRouter>
        </WindowFrame>
    )
}

export default App;