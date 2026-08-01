interface RetryStateProps {
    message: string;
    onRetry: () => void;
}

export default function RetryState({
    message,
    onRetry,
}: RetryStateProps) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-gray-500">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Reîncearcă
            </button>
        </div>
    );
}
