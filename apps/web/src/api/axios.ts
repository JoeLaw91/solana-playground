import { NEXT_PUBLIC_API_URL } from "@/configs/env.config";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

export default axiosInstance;