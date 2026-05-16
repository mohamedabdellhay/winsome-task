'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
      <div className="glass-card max-w-lg w-full p-12 text-center rounded-2xl shadow-2xl animate-slide-up">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center shadow-inner mb-4">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Something went wrong</h1>
        </div>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          We apologize for the inconvenience. An unexpected error occurred while processing your request. 
          Our team has been notified.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg text-left overflow-auto max-h-40">
            <p className="text-xs font-mono text-red-700 whitespace-pre-wrap">
              {error.message || 'Unknown error'}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => reset()} 
            variant="primary" 
            className="px-8 py-3"
          >
            Try Again
          </Button>
          <Link href="/dashboard" passHref>
            <Button variant="secondary" className="px-8 py-3">
              Return to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-slate-400">
          <p>If the problem persists, please contact our support desk.</p>
        </div>
      </div>
    </div>
  );
}
