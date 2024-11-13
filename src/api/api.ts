const apiUrl =  import.meta.env.VITE_API_URL; //"https://forge-of-battles-be.onrender.com"
const accessTokenKey = "@@auth0spajs@@::RAwUMFRHSVMcEUzNXc9PrBAMPZ2KQz57::https://forge-of-battles-be.onrender.com::openid profile email";

export interface CustomResponse {
    ok: boolean;
    status: number;
    body?: object | { message: string };
}

const getAccessToken = (): string | undefined => {
    const accessTokenObj = JSON.parse(localStorage.getItem(accessTokenKey) as string);
    if ("body" in accessTokenObj && "access_token" in accessTokenObj.body) {
        return accessTokenObj.body.access_token;
    } else {
        return undefined;
    }
}

export const customFetch = async (path: string, method?: string, body?: object): Promise<CustomResponse> => {
    try {
        const accessToken = getAccessToken();

        if (accessToken) {
            let headersInit: HeadersInit = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": `${body ? "application/json" : undefined}`
            }

            const init: RequestInit = {
                method: method ? method : "GET",
                headers: headersInit
            }

            if (body) {
                init.body = JSON.stringify(body)
            }

            const response: Response = await fetch(
                apiUrl + path,
                init
            );

            let responseBody: object | undefined | { message: string } = undefined;

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes('application/json')) {
                responseBody = await response.json();
            }

            if (response.status >= 200 && response.status < 400) {
                return { ok: true, status: response.status, body: responseBody}
            }
            else {
                if (response.status === 401) {
                    localStorage.clear();
                    window.location.reload();
                }

                return { ok: false, status: response.status, body: responseBody}
            }
        } else {
            return { ok: false, status: 401, body: { message: "Unauthorized" }}
        }
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            alert(error.message);
        } else {
            alert("An unknown error occurred");
        }

        return { ok: false, status: 500, body: undefined}
    }
}