import { Inter } from "next/font/google";
import "./globals.css";

import Footer from "@/components/footer";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: 'Pizza Palace',
	description: 'Pizza Palace'
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-white`}>
				<div className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
					<Header />
				</div>
				{children}
				<Footer />
			</body>
		</html >
	);
}
