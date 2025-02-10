import { useCallback, useEffect, useState } from "react";
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
import { LoadingOutlined, SwapOutlined } from "@ant-design/icons";
import { useToken } from "../../hooks";
import { Token } from "../../services/typings";
import { delay, exchangeRate } from "../../utils";
import TokenSelect from "../../components/TokenSelect";
import Title from "antd/es/typography/Title";

const SwapToken = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [tokenFrom, setTokenFrom] = useState<Token | undefined>(undefined);
  const [valueFrom, setValueFrom] = useState<number | null>(null);

  const [tokenTo, setTokenTo] = useState<Token | undefined>(undefined);
  const [valueTo, setValueTo] = useState<number | null>(null);

  const [loadingExchange, setLoadingExchange] = useState<boolean>(false);
  const [isAutoRefresh, toggleAutoRefesh] = useState<boolean>(false);

  const { data, loading, get } = useToken({
    onError: (m) => {
      messageApi.open({
        type: "error",
        content: m ?? "Get token failed",
      });
    },
    onSuccess: (t) => {
      if (!tokenFrom) {
        setTokenFrom(t[3]);
      }
      if (!tokenTo) {
        setTokenTo(t[2]);
      }
    },
  });

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

  const handleReCalculate = useCallback(
    (result: Token[]) => {
      if (tokenFrom && tokenTo && (valueFrom !== null || valueTo !== null)) {
        const tokenFromNew = result?.find(
          (v) => v.currency === tokenFrom.currency
        );
        const tokenToNew = result?.find((v) => v.currency === tokenTo.currency);
        const rate = exchangeRate(tokenFromNew?.price, tokenToNew?.price);
        if (valueFrom !== null) {
          setValueTo(valueFrom * rate);
        } else if (valueTo !== null) {
          setValueFrom(valueTo / rate);
        }
      }
    },
    [tokenFrom, tokenTo, valueFrom, valueTo]
  );

  console.log(1);
  

  const handleRefreshPriceToken = useCallback(async () => {
    try {
      const result = await get();
      handleReCalculate(result);
      messageApi.open({
        type: "success",
        content: "Refresh success",
      });
    } catch {
      messageApi.open({
        type: "error",
        content: "Refresh failed",
      });
    }
  }, [handleReCalculate, messageApi]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isAutoRefresh) {
      handleRefreshPriceToken();
      interval = setInterval(handleRefreshPriceToken, 10000);
    }

    return () => clearInterval(interval);
  }, [handleRefreshPriceToken, isAutoRefresh]);

  return (
    <>
      <Card title={<Title level={3}>Welcome to exchange price token</Title>}>
        <Spin spinning={loading || loadingExchange}>
          <Space style={{ minWidth: "400px" }} direction="vertical">
            <Space style={{ float: "left" }}>
              <Button
                color="cyan"
                variant="solid"
                onClick={handleRefreshPriceToken}
              >
                Refresh Price Token
              </Button>
              <Button
                icon={isAutoRefresh ? <LoadingOutlined /> : null}
                danger
                onClick={() => toggleAutoRefesh((v) => !v)}
              >
                {isAutoRefresh ? "Stop" : "Auto Refresh (10s)"}
              </Button>
            </Space>
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
                  placeholder="Please input amount token"
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
                  placeholder="Please input amount token"
                />
              </Col>
            </Row>
            <Row wrap={false} style={{ gap: "8px" }}>
              <Button
                color="primary"
                variant="outlined"
                onClick={handleSwap}
                block
                icon={<SwapOutlined />}
              >
                Swap Token
              </Button>
              <Button type="primary" onClick={handleExchange} block>
                Exchange Token
              </Button>
            </Row>
          </Space>
        </Spin>
      </Card>
      {contextHolder}
    </>
  );
};

export default SwapToken;
