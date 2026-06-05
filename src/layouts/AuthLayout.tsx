import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
}

function AuthLayout({
  children,
  title,
  subtitle,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">

        {/* Left */}

        <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white p-12 flex flex-col justify-center">

          <h1 className="text-5xl font-bold">
            PlaceMate
          </h1>

          <p className="mt-4 text-blue-100">
            Smart Placement Ecosystem
          </p>

          <div className="mt-10 space-y-4">

            <div>✓ Institute Management</div>

            <div>✓ Placement Tracking</div>

            <div>✓ Recruiter Management</div>

            <div>✓ Student Analytics</div>

          </div>

        </div>

        {/* Right */}

        <div className="p-12 flex flex-col justify-center">

          <h2 className="text-4xl font-bold text-slate-800">
            {title}
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            {subtitle}
          </p>

          {children}

        </div>

      </div>

    </div>
  );
}

export default AuthLayout;