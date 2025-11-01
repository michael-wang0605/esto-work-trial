"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import AuthWrapper from "@/components/AuthWrapper";
import Logo from "@/components/Logo";
import AdminBetaPanel from "@/components/AdminBetaPanel";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  accounts: Array<{
    provider: string;
    providerAccountId: string;
  }>;
}

interface BetaApplication {
  id: string;
  name: string;
  email: string;
  location: string;
  estimatedAssets: string;
  companyName: string;
  role: string;
  additionalInfo: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [betaApplications, setBetaApplications] = useState<BetaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'beta'>('users');
  const pathname = usePathname();

  useEffect(() => {
    fetchUsers();
    fetchBetaApplications();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchBetaApplications = async () => {
    try {
      const response = await fetch("/api/admin/beta-applications");
      const data = await response.json();
      
      if (data.applications) {
        setBetaApplications(data.applications);
      } else {
        console.error("Failed to fetch beta applications:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch beta applications:", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen w-full text-slate-900 bg-white relative overflow-clip flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 text-white rounded-md hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <PageLayout loading={loading} loadingMessage="Loading user data...">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-300/60 bg-white/90">
          <nav className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Logo />
                </Link>
              </div>
              <div className="flex items-center gap-3">
                {/* Only show Join Closed Beta button when not on beta-signup page */}
                {pathname !== "/beta-signup" && (
                  <Link
                    href="/beta-signup"
                    className="text-sm px-4 py-2 rounded-xl border border-slate-300/60 text-slate-700 hover:bg-slate-50/70 transition-colors"
                  >
                    Join Closed Beta
                  </Link>
                )}
                {/* Preview Button */}
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 px-3 py-1.5 text-sm text-white hover:opacity-95 transition-opacity"
                >
                  Preview
                </Link>
                <div className="text-sm text-slate-500">
                  Total Users: {users.length}
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-28">
         <div className="rounded-2xl border border-slate-300/60 bg-white/80 backdrop-blur-xl shadow-2xl ring-1 ring-slate-300/40 p-8">
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-6">
             Admin Panel
           </h1>

           {/* Tab Navigation */}
           <div className="flex space-x-1 mb-8">
             <button
               onClick={() => setActiveTab('users')}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                 activeTab === 'users'
                   ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                   : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
               }`}
             >
               Users ({users.length})
             </button>
             <button
               onClick={() => setActiveTab('beta')}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                 activeTab === 'beta'
                   ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                   : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
               }`}
             >
               Beta Applications ({betaApplications.length})
             </button>
           </div>
          
                     {/* Users Tab */}
           {activeTab === 'users' && (
             <>
               <h2 className="text-2xl font-bold text-slate-800 mb-4">User Information</h2>
               {users.length === 0 ? (
                 <div className="text-center py-8">
                   <p className="text-gray-500">No users have signed up yet.</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-slate-200">
                     <thead className="bg-slate-50/80">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                           User
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                           Email
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                           Provider
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                           Signed Up
                         </th>
                       </tr>
                     </thead>
                     <tbody className="bg-white/60 divide-y divide-slate-200">
                       {users.map((user) => (
                         <tr key={user.id}>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <div className="flex items-center">
                               {user.image ? (
                                 <img
                                   className="h-10 w-10 rounded-full"
                                   src={user.image}
                                   alt={user.name || "User"}
                                 />
                               ) : (
                                 <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                   <span className="text-sm text-gray-600 font-medium">
                                     {user.name?.[0] || user.email?.[0] || "U"}
                                   </span>
                                 </div>
                               )}
                               <div className="ml-4">
                                 <div className="text-sm font-medium text-slate-800">
                                   {user.name || "No name"}
                                 </div>
                                 <div className="text-sm text-slate-500">
                                   ID: {user.id.slice(0, 8)}...
                                 </div>
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                             {user.email || "No email"}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             {user.accounts.map((account) => (
                               <span
                                 key={account.provider}
                                 className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200"
                               >
                                 {account.provider}
                               </span>
                             ))}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                             {new Date(user.createdAt).toLocaleDateString()}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </>
           )}

           {/* Beta Applications Tab */}
           {activeTab === 'beta' && <AdminBetaPanel />}
         </div>
       </div>
      </PageLayout>
    </AuthWrapper>
  );
}
