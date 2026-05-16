'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
      <div className="glass-card max-w-lg w-full p-12 text-center rounded-2xl shadow-2xl animate-zoom-in">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[var(--brand-primary)] opacity-20">404</h1>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          It seems you've wandered into an uncharted area of our hotel. 
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col gap-3">
       
          <Link href="/" passHref>
            <Button variant="primary" className="w-full py-4 text-slate-500 hover:text-slate-700">
              Go to Home Page
            </Button>
          </Link>
        </div>
        
     
      </div>
    </div>
  );
}
