const apiUrl = "https://forge-of-battles-be.onrender.com" //import.meta.env.VITE_API_URL;
const accessTokenKey = "@@auth0spajs@@::RAwUMFRHSVMcEUzNXc9PrBAMPZ2KQz57::https://forge-of-battles-be.onrender.com::openid profile email";

export interface CustomResponse {
    ok: boolean;
    status: number;
    body?: object | { message: string };
}

const getAccessToken = () => {
    const accessTokenObj = localStorage.getItem(accessTokenKey);
    return accessTokenObj ? JSON.parse(accessTokenObj as string) : null;
}

export const customFetch = async (path: string, method?: string, body?: object): Promise<CustomResponse> => {
    try {
        const accessToken = getAccessToken();

        if (accessToken) {
            let headersInit: HeadersInit = {
                Authorization: `Bearer ${accessToken.access_token}`,
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