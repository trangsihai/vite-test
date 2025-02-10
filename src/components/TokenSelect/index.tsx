import { Avatar, Select, Space } from "antd";
import { Token } from "../../services/typings";

const { Option } = Select;

interface Props {
  value: string | undefined;
  onChange: (v: Token) => void;
  options: Token[] | undefined;
}

const TokenSelect = ({ value, onChange, options }: Props) => {
  return (
    <Select
      value={value}
      labelInValue
      showSearch
      filterOption={(input, option) => {
        return (option?.data?.currency ?? "")
          .toLowerCase()
          .includes(input.toLowerCase());
      }}
      style={{ width: "100%" }}
      onChange={(_, v) => {
        onChange((v as { data: Token }).data);
      }}
      placeholder="Please select token"
    >
      {options?.map((v) => (
        <Option key={`${v.currency}-${v.price}`} value={v.currency} data={v}>
          <Space>
            <Avatar
              size={20}
              src={
                <img
                  src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${v.currency}.svg`}
                  alt={v.currency}
                />
              }
            />
            {v.currency}
          </Space>
        </Option>
      ))}
    </Select>
  );
};

export default TokenSelect;
