import { Inter, Geist } from "next/font/google";
import "./globals.css";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/container";
import { ToasterProvider } from "@/providers/toast-provider";
import { CartProvider } from "@/contexts/cart-context";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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
		<html lang="en" className={cn("font-sans", geist.variable)}>
			<body className={`${inter.className} bg-white`}>
				<CartProvider>
					<ToasterProvider />
					<Container>
						<div className="fixed inset-x-0 top-0 z-50 bg-white">
							<Header />
						</div>
						<div className="top-18 mt-4">
							{children}
						</div>
						<Footer />
					</Container>
				</CartProvider>
			</body>
		</html >
	);
}
