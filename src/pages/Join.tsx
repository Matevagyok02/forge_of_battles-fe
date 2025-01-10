import {useNavigate, useParams} from "react-router-dom";
import {FC} from "react";
import {joinMatch} from "../api/homePageRequests.ts";

const Join: FC = () => {

    const key = useParams().key;
    const navigate = useNavigate();

    joinMatch(key as string).then(result => {
        if (result.ok) {
            navigate("/preparation/" + key);
        } else {
            navigate("/");
        }
    });

    return (
        <div id="empty-screen" ></div>
    );
}

export default Join;