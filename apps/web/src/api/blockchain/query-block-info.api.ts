import { NEXT_PUBLIC_API_URL } from "@/configs/env.config";
import apiHandler from "../handler/apiHandler";
import { fillUrlParameter } from "@/lib/utils/utils";
import { BLOCKCHAIN_ENDPOINTS } from "@/lib/constants/blockchain-endpoints";
import { BlockInfo } from "../types/block-info.types";

const queryBlockInfoApi = async (blockNumber: string) => {
  return await apiHandler<{ blockInfo: BlockInfo }>(
    "GET",
    `${NEXT_PUBLIC_API_URL}${fillUrlParameter(BLOCKCHAIN_ENDPOINTS.GET_BLOCK_INFO, "blockNumber", blockNumber)}`
  );
}

export default queryBlockInfoApi;