import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            
            <Header />
                {children}
            <Footer />
            
        </>
    );
}