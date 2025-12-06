export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-mindful-bg">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-mindful-green">
          MindfulViscan is Live! 🚀
        </h1>
        <p className="text-lg bg-mindful-green">Welcome to your mindfulness journey</p>
        <button className="px-8 py-3 bg-mindful-green hover:bg-mindful-dark text-mindful-bg font-semibold rounded-lg transition duration-200">
          Get Started
        </button>
      </div>
    </main>
  );
}