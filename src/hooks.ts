import { useEffect, useState } from "react";
import { getTokens } from "./services";
import { Token } from "./services/typings";

interface Props {
  onError?: (v: string) => void;
  onSuccess?: (v: Token[]) => void;
}

export const useToken = (v?: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Token[] | undefined>(undefined);

  const getTokenData = async () => {
    setLoading(true);
    try {
      await setTimeout(() => {}, 5000);
      const res = await getTokens();
      setData(res);
      v?.onSuccess?.(res);
      return res;
    } catch (e) {
      if (e instanceof Error) v?.onError?.(e?.message ?? "Server error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTokenData();
  }, []);

  return {
    loading,
    data,
    get: getTokenData,
  };
};
