import { SignUp } from '@clerk/nextjs';
import NavBar from '@/app/components/NavBar';

export default function SignUpCounselorPage() {
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
              path="/sign-up-counselor"
              signInUrl="/sign-in"
              forceRedirectUrl="/verify-counselor"
              afterSignUpUrl="/post-sign-up-counselor"
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
        </div>
      </div>
    </main>
  );
}

