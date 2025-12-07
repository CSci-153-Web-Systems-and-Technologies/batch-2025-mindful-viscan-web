import NavBar from "./components/NavBar";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar isLoggedIn={false} />
    </main>
  );
}