import SellForm from "../components/Sell/SellForm";

export default function SellPage() {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="mb-8 text-3xl font-bold">
                Publică un anunț
            </h1>

            <SellForm />
        </main>
    );
}