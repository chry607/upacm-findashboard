"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Receipt, DollarSign, FolderKanban, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
	{ href: "/", label: "Home", icon: Home },
	{ href: "/expenses", label: "Expenses", icon: Receipt },
	{ href: "/revenue", label: "Revenue", icon: DollarSign },
	{ href: "/project", label: "Projects", icon: FolderKanban },
];

export default function SideNavigation() {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();

	return (
		<aside className="group/nav flex h-screen w-16 hover:w-64 flex-col border-r bg-background transition-[width] duration-300 ease-in-out">
			<div className="flex h-14 items-center justify-center group-hover/nav:justify-start group-hover/nav:px-4 overflow-hidden">
				<Image
					src="/logo.png"
					alt="FinDashboard Logo"
					width={32}
					height={32}
					priority
					unoptimized
					className="shrink-0"
				/>
				<span className="ml-3 text-lg font-semibold tracking-tight whitespace-nowrap hidden group-hover/nav:inline">
					Financial Dashboard
				</span>
			</div>
			<Separator />
			<nav className="flex-1 space-y-1 p-2">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;

					return (
						<Button
							key={item.href}
							variant={isActive ? "default" : "ghost"}
							size="icon"
							className={cn(
								"w-full h-10 justify-center group-hover/nav:justify-start group-hover/nav:px-3",
								!isActive && "text-muted-foreground"
							)}
							asChild
						>
							<Link href={item.href}>
								<Icon className="h-5 w-5 shrink-0" />
								<span className="ml-3 hidden group-hover/nav:inline whitespace-nowrap">
									{item.label}
								</span>
							</Link>
						</Button>
					);
				})}
			<div className="p-2 mt-auto">
				<Separator className="mb-2" />
				<Button
					variant="ghost"
					size="icon"
					className="w-full h-10 justify-center group-hover/nav:justify-start group-hover/nav:px-3"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					<Sun className="h-5 w-5 shrink-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-5 w-5 shrink-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="ml-3 hidden group-hover/nav:inline whitespace-nowrap">
						Light/Dark Theme
					</span>
				</Button>
			</div>
			</nav>
		</aside>
	);
}