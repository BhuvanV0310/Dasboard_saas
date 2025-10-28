import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-config";
import { redirect } from "next/navigation";
import AdminDashboard from "../dashboard/components/AdminDashboard";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#eaf1fb]">
      <main className="p-10">
        <AdminDashboard />
      </main>
    </div>
  );
}
