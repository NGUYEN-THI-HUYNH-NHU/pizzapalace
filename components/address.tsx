interface AddressProps {
    data: string
}

const Address: React.FC<AddressProps> = ({
    data
}) => {
    return (
        <div className="flex flex-col items-start">
            <p className="text-gray-500">
                Giao hàng tới:
            </p>
            {data}
        </div>
    );
}

export default Address;