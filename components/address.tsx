interface AddressProps {
  data?: string | null;
  onClick?: () => void;
}

const Address: React.FC<AddressProps> = ({ data, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-haspopup="dialog"
      className="flex flex-col focus:outline-none"
    >
      <p className="text-gray-700 cursor-pointer">Bạn đang ở đâu?</p>
      <p className={data ? "" : "text-gray-400 cursor-pointer"}>{data || "Chưa có địa chỉ"}</p>
    </button>
  );
};

export default Address;
