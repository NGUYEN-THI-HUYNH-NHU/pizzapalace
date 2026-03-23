interface AddressProps {
    data?: string | null;
}

const Address: React.FC<AddressProps> = ({
    data
}) => {
    return (
        <div className="flex flex-col items-start">
            <p className="text-gray-500">
                Giao hàng tới:
            </p>
            <p>{data || "Chưa có địa chỉ"}</p>
        </div>
    );
}

export default Address;