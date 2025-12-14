import NavBar from "@/app/components/NavBar";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NavBar />
            {children}
        </>
    );
}
