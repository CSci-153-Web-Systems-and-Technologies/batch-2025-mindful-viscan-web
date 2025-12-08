import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar />
      <div className="flex flex-grow items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-[#031207] p-10 md:p-16 min-h-[500px] border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] flex flex-col items-center">
            <SignUp 
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl="/post-sign-up"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "text-[#42734D] font-kodchasan text-3xl font-medium text-center",
                  headerSubtitle: "text-gray-200 font-kodchasan text-center",
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
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-200 font-kodchasan text-lg">
              Are you a certified professional?
            </p>
            <Link 
              href="/sign-up-counselor"
              className="inline-block px-6 py-3 rounded-lg bg-[#0F1E0F] border border-[#42734D]/30 text-[#42734D] font-medium hover:bg-[#42734D] hover:text-white transition-colors duration-200"
            >
              Apply as a Counselor
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

