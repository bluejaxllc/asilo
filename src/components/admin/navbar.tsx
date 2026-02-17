import { UserNav } from "@/components/admin/user-nav";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";

export const Navbar = () => {
    return (
        <div className="flex items-center p-4">
            <MobileSidebar />
            <div className="flex w-full justify-end">
                <UserNav />
            </div>
        </div>
    );
}
