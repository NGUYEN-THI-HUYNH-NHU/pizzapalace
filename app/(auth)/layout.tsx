export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <main className="container mx-auto py-10">{children}</main>;
}
