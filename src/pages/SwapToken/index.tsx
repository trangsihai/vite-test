import { useCallback, useState } from "react";
import {
  Button,
  Card,
  Col,
  InputNumber,
  message,
  Row,
  Space,
  Spin,
} from "antd";
import { useToken } from "../../hooks";
import { Token } from "../../services/typings";
import { delay, exchangeRate } from "../../utils";
import TokenSelect from "../../components/TokenSelect";

const SwapToken = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [tokenFrom, setTokenFrom] = useState<Token | undefined>(undefined);
  const [valueFrom, setValueFrom] = useState<number | null>(null);

  const [tokenTo, setTokenTo] = useState<Token | undefined>(undefined);
  const [valueTo, setValueTo] = useState<number | null>(null);

  const [loadingExchange, setLoadingExchange] = useState<boolean>(false);
  const { data, loading, get } = useToken({
    onError: () => {
      messageApi.open({
        type: "error",
        content: "Get token failed",
      });
    },
  });

  const handleRefreshPriceToken = async () => {
    try {
      await get();
      setValueFrom(null);
      setValueTo(null);
      setTokenFrom(undefined);
      setTokenTo(undefined);
      messageApi.open({
        type: "success",
        content: "Refresh success",
      });
      // eslint-disable-next-line no-empty
    } catch {}
  };

  const handleChangeValueFrom = useCallback(
    (v: number | null) => {
      if (v !== null) {
        const rate = exchangeRate(tokenFrom?.price, tokenTo?.price);
        setValueFrom(v);
        setValueTo(v * rate);
      } else {
        setValueFrom(null);
        setValueTo(null);
      }
    },
    [tokenFrom?.price, tokenTo?.price]
  );

  const handleChangeValueTo = useCallback(
    (v: number | null) => {
      if (v !== null) {
        const rate = exchangeRate(tokenFrom?.price, tokenTo?.price);
        setValueTo(v);
        setValueFrom(v / rate);
      } else {
        setValueFrom(null);
        setValueTo(null);
      }
    },
    [tokenFrom?.price, tokenTo?.price]
  );

  const handleSelectTokenFrom = useCallback(
    (v: Token) => {
      const rate = exchangeRate(v?.price, tokenTo?.price);
      setTokenFrom(v);
      setValueTo(valueFrom !== null ? valueFrom * rate : null);
    },
    [tokenTo?.price, valueFrom]
  );

  const handleSelectTokenTo = useCallback(
    (v: Token) => {
      const rate = exchangeRate(tokenFrom?.price, v?.price);
      setTokenTo(v);
      setValueFrom(valueTo !== null ? valueTo / rate : null);
    },
    [tokenFrom?.price, valueTo]
  );

  const handleSwap = useCallback(() => {
    if (tokenTo && tokenFrom) {
      setValueFrom(valueTo);
      setValueTo(valueFrom);
      setTokenFrom(tokenTo);
      setTokenTo(tokenFrom);
    } else {
      messageApi.open({
        type: "error",
        content: "Please input before swap token",
      });
    }
  }, [messageApi, tokenFrom, tokenTo, valueFrom, valueTo]);

  const handleExchange = useCallback(async () => {
    setLoadingExchange(true);
    try {
      await delay(500).then(() => {
        if (!tokenFrom || !tokenTo || (!valueFrom && !valueTo)) {
          messageApi.open({
            type: "error",
            content: "Exchange token failed",
          });
        } else {
          messageApi.open({
            type: "success",
            content: "Exchange token success",
          });
        }
      });
    } finally {
      setLoadingExchange(false);
    }
  }, [messageApi, tokenFrom, tokenTo, valueFrom, valueTo]);

  return (
    <>
      <Card>
        <Spin spinning={loading || loadingExchange}>
          <Space style={{ minWidth: "400px" }} direction="vertical">
            <Button
              style={{ float: "left" }}
              color="cyan"
              variant="solid"
              onClick={handleRefreshPriceToken}
            >
              Refresh Price Token
            </Button>
            <Row wrap={false} style={{ gap: "4px" }}>
              <Col span={10}>
                <TokenSelect
                  options={data}
                  value={tokenFrom?.currency}
                  onChange={(v) => handleSelectTokenFrom(v)}
                />
              </Col>
              <Col span={14}>
                <InputNumber
                  min={0}
                  value={valueFrom}
                  onChange={handleChangeValueFrom}
                  style={{ width: "100%" }}
                  placeholder="Please input price"
                />
              </Col>
            </Row>
            <Row wrap={false} style={{ gap: "4px" }}>
              <Col span={10}>
                <TokenSelect
                  options={data}
                  value={tokenTo?.currency}
                  onChange={(v) => handleSelectTokenTo(v)}
                />
              </Col>
              <Col span={14}>
                <InputNumber
                  min={0}
                  value={valueTo}
                  onChange={handleChangeValueTo}
                  style={{ width: "100%" }}
                  placeholder="Please input price"
                />
              </Col>
            </Row>
            <Space>
              <Button color="primary" variant="outlined" onClick={handleSwap}>
                Swap Token
              </Button>
              <Button type="primary" onClick={handleExchange}>
                Exchange Token
              </Button>
            </Space>
          </Space>
        </Spin>
      </Card>
      {contextHolder}
    </>
  );
};

export default SwapToken;
