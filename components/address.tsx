interface AddressProps {
  data?: string | null;
  onClick?: () => void;
}

const Address: React.FC<AddressProps> = ({ data, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-haspopup="dialog"
      className="flex flex-col items-start focus:outline-none"
    >
      <p className="text-gray-500">Bạn đang ở đâu?</p>
      <p className={data ? "" : "text-gray-400"}>{data || "Chưa có địa chỉ"}</p>
    </button>
  );
};

export default Address;
