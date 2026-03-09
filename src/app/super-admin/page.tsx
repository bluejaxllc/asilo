import { getPlatformStats, getFacilitiesList } from "@/actions/super-admin";
import { Building2, Users, Activity, Crown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
    const stats = await getPlatformStats();
    const facilities = await getFacilitiesList();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
                <p className="text-slate-400">High-level metrics for all Asilo platform usage.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/10 bg-[#121212] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Total Facilities</h3>
                        <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalFacilities}</div>
                </div>

                <div className="rounded-xl border border-border/10 bg-[#121212] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Total Users</h3>
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                </div>

                <div className="rounded-xl border border-border/10 bg-[#121212] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Total Patients</h3>
                        <Activity className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalPatients}</div>
                </div>

                <div className="rounded-xl border border-border/10 bg-[#121212] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Premium Tenants</h3>
                        <Crown className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.premiumFacilities}</div>
                </div>
            </div>

            {/* Facilities Table */}
            <div className="rounded-xl border border-border/10 bg-[#121212] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/10">
                    <h2 className="text-xl font-semibold text-white">Registered Facilities</h2>
                    <p className="text-sm text-slate-400 mt-1">A platform-wide list of all tenants and their usage sizes.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-[#1a1a1a] text-slate-400 border-b border-border/10">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Facility Name</th>
                                <th scope="col" className="px-6 py-4 font-medium">Plan</th>
                                <th scope="col" className="px-6 py-4 font-medium">Created At</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Users</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Patients</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 text-slate-300">
                            {facilities.map((facility) => (
                                <tr key={facility.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{facility.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${facility.plan === "FREE"
                                                ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                : facility.plan === "ENTERPRISE"
                                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                            }`}>
                                            {facility.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {format(new Date(facility.createdAt), "dd MMM yyyy", { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">{facility._count.users}</td>
                                    <td className="px-6 py-4 text-right tabular-nums">{facility._count.patients}</td>
                                </tr>
                            ))}
                            {facilities.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No facilities registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
