import Link from "next/link";
import Address from "./address";
import Tools from "./tools";

const Header = () => {
    return (
        <div className="p-3 px-12">
            <div className="grid grid-cols-3">
                <Address data="12, Nguyen Van Bao, ..." />
                <div className="flex items-center justify-center">
                    <Link href="/" className="font-bold text-xl">
                        <p className="font-bold text-2xl">PizzaPalace</p>
                    </Link>
                </div>
                <div className="flex items-center justify-end">
                    <Tools />
                </div>
            </div>
        </div>
    );
}

export default Header;