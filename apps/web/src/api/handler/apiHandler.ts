import { AxiosResponse } from "axios";
import axiosInstance from "../axios";

const apiHandler = async <T = any>(
  method: string,
  url: string,
  body?: object,
) => {
  try {

    let response: AxiosResponse<T>;
    if (method === "GET") {
      response = await axiosInstance.get(url);
    } else if (method === "POST") {
      response = await axiosInstance.post(url, body);
    } else if (method === "PATCH") {
      response = await axiosInstance.patch(url, body);
    } else if (method === "PUT") {
      response = await axiosInstance.put(url, body);
    } else if (method === "DELETE") {
      response = await axiosInstance.delete(url);
    } else {
      throw new Error("Invalid HTTP method");
    }

    return response;
  } catch (err: any) {
    throw err;
  }
};

export default apiHandler;