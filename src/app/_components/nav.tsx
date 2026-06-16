import Link from "next/link";
import { auth, signOut } from "~/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HowToPlay } from "./how-to-play";

export async function Nav() {
  const session = await auth();
  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/picks" className="text-sm font-semibold tracking-tight">
          wc picks
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            leaderboard
          </Link>
          <HowToPlay />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name ?? ""}
                  />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-muted-foreground text-center text-xs">
                {session.user.name}
              </DropdownMenuLabel>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <DropdownMenuItem asChild>
                  <button
                    type="submit"
                    className="w-full justify-center text-center text-sm"
                  >
                    sign out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
