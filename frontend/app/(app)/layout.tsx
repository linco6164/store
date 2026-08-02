import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer/Footer";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />

            <main className="min-h-screen">
                {children}
            </main>

            <Footer />
        </>
    );
}