import './globals.css';
import React from 'react';

export const metadata = {
  title: 'TypeVision Admin Control Center',
  description: 'Manage typing curriculum, lessons, theory, and system analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#020617] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
