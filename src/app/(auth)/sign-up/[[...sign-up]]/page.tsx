import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar />
      <div className="flex flex-grow items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-[#031207] p-10 md:p-16 min-h-[500px] border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] flex flex-col items-center space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-[#42734D] font-kodchasan text-3xl font-medium">
                Create your account
              </h1>
              <p className="text-gray-200 font-kodchasan">
                Welcome! Please fill in the details to get started.
              </p>
            </div>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-mindful-green hover:bg-mindful-green/80 text-white border-0",
                  formButtonPrimary: "bg-mindful-green hover:bg-mindful-green/80 text-white",
                  formFieldInput: "bg-[#0F1E0F] border-gray-700 text-white",
                  formFieldLabel: "text-gray-200",
                  footerActionLink: "text-mindful-green hover:text-mindful-green/80",
                  identityPreviewText: "text-gray-200",
                  identityPreviewEditButton: "text-mindful-green hover:text-mindful-green/80",
                },
              }}
            />
          </div>

          {/* Counselor Section */}
          {/* Peer Counselor Section */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-white font-kodchasan text-xl font-medium">
              Interested in helping others as a Peer Counselor?
            </p>
            <Link
              href="/sign-up-counselor"
              className="inline-block px-8 py-4 rounded-xl bg-mindful-green text-white font-bold text-lg hover:bg-mindful-green/80 hover:scale-105 transition-all duration-200 shadow-[0px_4px_15px_rgba(34,197,94,0.3)]"
            >
              Join as a Peer Counselor
            </Link>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              You don&apos;t need to be a professional—just a willing ear and a kind heart.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

