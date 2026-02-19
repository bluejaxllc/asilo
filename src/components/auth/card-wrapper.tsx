"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { ScaleIn } from "@/components/ui/motion-wrapper";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
};

export const CardWrapper = ({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref,
    showSocial
}: CardWrapperProps) => {
    return (
        <ScaleIn>
            <Card className="w-[420px] max-w-full mx-auto shadow-2xl shadow-black/30 border-border bg-card/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden">
                {/* Gradient top accent */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <CardHeader className="pb-4 pt-8">
                    <Header label={headerLabel} />
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
                {showSocial && (
                    <CardFooter className="px-6 pb-4">
                        <Social />
                    </CardFooter>
                )}
                <CardFooter className="px-6 pb-6">
                    <BackButton
                        label={backButtonLabel}
                        href={backButtonHref}
                    />
                </CardFooter>
            </Card>
        </ScaleIn>
    );
};
