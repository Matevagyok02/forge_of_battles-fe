import {customFetch, HttpMethod} from "./api.ts";
const namespace = "/user";

export const getUser = async () =>
    await customFetch(
        namespace
    );

export const findByUsername = async (username: string) =>
    await customFetch(
        namespace + "/find?username=" + username
    );

export const registerNewUser = async (username: string, picture?: string) =>
    await customFetch(
         namespace + "/register",
        HttpMethod.post,
        {username, picture}
    );

export const changePicture = async (id: string) =>
    await customFetch(
        namespace + "/picture?id=" + id,
        HttpMethod.put
    );

export const findPlayerById = async (id: string) =>
    await customFetch(
        namespace + "/find?id=" + id
    );