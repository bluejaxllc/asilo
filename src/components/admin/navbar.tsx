import { UserNav } from "@/components/admin/user-nav";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = () => {
    return (
        <div className="flex items-center h-14 px-6 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
            <MobileSidebar />
            <div className="flex w-full justify-end items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En línea
                </div>
                <ThemeToggle />
                <UserNav />
            </div>
        </div>
    );
}
