"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                    エラーが発生しました
                </h2>
                <div className="bg-red-50 p-3 rounded text-left mb-6 overflow-auto max-h-40">
                    <p className="text-sm font-mono text-red-700 break-words">
                        {error.message || "Something went wrong"}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-red-500 mt-2 font-mono">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    再読み込み
                </button>
            </div>
        </div>
    );
}
