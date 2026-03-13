import MobileWarningDialog from "@/components/MobileWarningDialog";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileWarningDialog />
      {children}
    </>
  );
}
