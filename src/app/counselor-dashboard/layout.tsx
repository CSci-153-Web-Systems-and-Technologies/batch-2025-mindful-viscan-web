import CounselorNavBar from "@/app/components/counselor/CounselorNavBar";

export default function CounselorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <CounselorNavBar />
            {children}
        </>
    );
}
