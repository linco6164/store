interface FullPageLoaderProps {
    label?: string;
    compact?: boolean;
}

export default function FullPageLoader({
    label = "Se încarcă…",
    compact = false,
}: FullPageLoaderProps) {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            className={`flex items-center justify-center ${
                compact
                    ? "min-h-32"
                    : "min-h-[calc(100vh-64px)]"
            }`}
        >
            <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
                <div
                    aria-hidden="true"
                    className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 motion-reduce:animate-none"
                />
                <span>{label}</span>
            </div>
        </div>
    );
}
