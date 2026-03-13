import MobileWarningDialog from "@/components/MobileWarningDialog";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileWarningDialog />
      {children}
    </>
  );
}
