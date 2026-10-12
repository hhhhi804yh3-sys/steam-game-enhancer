import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans text-gray-900">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black text-[#E60012] font-mono tracking-tighter">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The requested page does not exist or has been relocated.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#E60012] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#CC0010]"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans text-gray-900">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Application Error
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          An unexpected error occurred. You can retry or return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-[#E60012] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#CC0010]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SteamSwitch — The Nintendo-Inspired PC Gaming Hub" },
      { 
        name: "description", 
        content: "SteamSwitch is the ultimate console-style gaming hub for PC. Enjoy free 5-minute passes, instant Steam bypass tools, and sleek Joy-Con aesthetics." 
      },
      { 
        name: "keywords", 
        content: "steamswitch, nintendo switch pc, steam bypass, steam launcher, free game session, gaming console ui" 
      },
      { name: "author", content: "SteamSwitch Team" },
      { name: "theme-color", content: "#E60012" },
      { name: "robots", content: "index, follow" },
      
      // OpenGraph
      { property: "og:site_name", content: "SteamSwitch" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "SteamSwitch — Console Experience for Steam on PC" },
      { 
        property: "og:description", 
        content: "Bring the Nintendo Switch console experience to your Steam PC library." 
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased selection:bg-[#E60012] selection:text-white">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
