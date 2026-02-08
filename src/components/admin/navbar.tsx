import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserButton } from "@/components/auth/user-button";

export const Navbar = () => {
    return (
        <div className="flex items-center p-4">
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
            </Button>
            <div className="flex w-full justify-end">
                <UserButton />
            </div>
        </div>
    );
}
