import {useParams} from "react-router-dom";
import {FC} from "react";

const Battle: FC = () => {

    const key = useParams().key;

    return(
        <main>
            <h1 className="flex h-full items-center justify-center text-9xl animate-pulse" >{key}</h1>
        </main>
    );
}

export default Battle;