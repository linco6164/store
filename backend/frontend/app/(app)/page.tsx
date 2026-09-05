export default function HomePage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center px-6">

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl animate-pulse" />

                <div
                    className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-500/20 blur-3xl animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                />

                <div
                    className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl animate-pulse"
                    style={{ animationDelay: "3s" }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl text-center">

                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-bounce">
                    <span className="text-6xl">🚀</span>
                </div>

                <h1 className="mt-10 text-6xl md:text-7xl font-extrabold text-white tracking-tight">
                    Nexora
                </h1>

                <p className="mt-6 text-3xl font-semibold text-cyan-400">
                    Website în dezvoltare
                </p>

                <p className="mt-6 text-lg leading-8 text-gray-300 max-w-xl mx-auto">
                    Construim o nouă generație de marketplace C2C.
                    Lucrăm intens pentru a vă oferi cea mai rapidă și sigură
                    experiență de cumpărare și vânzare.
                </p>

                {/* Loader */}
                <div className="mt-12 flex justify-center">
                    <div className="flex gap-3">
                        <div className="h-4 w-4 rounded-full bg-cyan-400 animate-bounce" />
                        <div
                            className="h-4 w-4 rounded-full bg-cyan-400 animate-bounce"
                            style={{ animationDelay: ".15s" }}
                        />
                        <div
                            className="h-4 w-4 rounded-full bg-cyan-400 animate-bounce"
                            style={{ animationDelay: ".3s" }}
                        />
                    </div>
                </div>

                <div className="mt-14 flex justify-center gap-4 flex-wrap">
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-5 py-2 text-cyan-300">
                        🚀 Lansare în curând
                    </span>

                    <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-purple-300">
                        📱 Android & iOS
                    </span>

                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-emerald-300">
                        🔒 Sigur & Rapid
                    </span>
                </div>

                <div className="mt-16">
                    <p className="text-gray-500">
                        © {new Date().getFullYear()} Nexora. Toate drepturile rezervate.
                    </p>
                </div>

            </div>
        </main>
    );
}