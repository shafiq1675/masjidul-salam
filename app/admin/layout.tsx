import { AuthProvider } from "@/app/context/AuthContext";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
