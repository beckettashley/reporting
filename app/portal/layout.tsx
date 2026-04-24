import { Metadata } from "next";
import PortalSidebar from "@/components/portal/sidebar";

export const metadata: Metadata = {
  title: "Merchant Portal | Velocity",
  description: "Manage your funnels, experiments, and products",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PortalSidebar />
      {/* Main content area with sidebar offset */}
      <div className="lg:pl-64 pt-12 lg:pt-0">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
