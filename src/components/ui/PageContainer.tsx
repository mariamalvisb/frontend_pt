"use client";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 flex justify-center">
      <div className="w-full max-w-5xl">{children}</div>
    </main>
  );
}
