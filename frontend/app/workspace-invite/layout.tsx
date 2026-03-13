import MobileWarningDialog from "@/components/MobileWarningDialog";

export default function WorkspaceInviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileWarningDialog />
      {children}
    </>
  );
}