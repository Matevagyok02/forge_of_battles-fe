import {FC} from "react";

const LoadingScreen : FC <{loading ?: boolean}> = ({loading = true}) => {
    return( loading &&
        <div id="loading-screen">
            <div className=" text-primary" role="status">
                <span className="animate-ping">Loading...</span>
            </div>
        </div>
    )
}
export default LoadingScreen