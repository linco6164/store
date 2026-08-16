export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-600/20 border border-blue-500 mb-8">
                    <span className="text-5xl">🚧</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
                    Nexora
                </h1>

                <p className="text-2xl font-semibold text-blue-400 mb-4">
                    Website în dezvoltare
                </p>

                <p className="text-gray-300 text-lg leading-8 mb-10">
                    Lucrăm la construirea unei platforme moderne de marketplace C2C.
                    Revenim în curând cu o experiență complet nouă pentru cumpărare,
                    vânzare și livrare rapidă.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <span className="px-5 py-2 rounded-full bg-white/10 text-white border border-white/20">
                        🚀 Lansare în curând
                    </span>

                    <span className="px-5 py-2 rounded-full bg-white/10 text-white border border-white/20">
                        📱 Aplicație mobilă
                    </span>

                    <span className="px-5 py-2 rounded-full bg-white/10 text-white border border-white/20">
                        🔒 Sigur & Rapid
                    </span>
                </div>

                <div className="mt-12">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Nexora. Toate drepturile rezervate.
                    </p>
                </div>
            </div>
        </main>
    );
}