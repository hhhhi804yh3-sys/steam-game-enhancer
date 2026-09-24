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
    <div className="flex min-h-screen items-center justify-center bg-[#07090e] px-4 font-sans text-slate-100">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black text-cyan-400 font-mono tracking-tighter">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-100">Page not found</h2>
        <p className="mt-2 text-sm text-slate-400">
          The requested page does not exist or has been relocated.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
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
    <div className="flex min-h-screen items-center justify-center bg-[#07090e] px-4 font-sans text-slate-100">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Application Error
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          An unexpected error occurred. You can retry or return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
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
      { title: "CyaswTools — Ultimate Steam Game Fix & Library Utility" },
      { 
        name: "description", 
        content: "CyaswTools is the ultimate lightweight utility for Steam game lovers. Easily add games to your Steam library, apply fixes, and launch instantly with one click." 
      },
      { 
        name: "keywords", 
        content: "cyaswtools, cysaw tools, steamtool, steam library fix, steam bypass, add games to steam, steam utility, pc gaming helper" 
      },
      { name: "author", content: "CyaswTools Dev Team" },
      { name: "theme-color", content: "#07090e" },
      { name: "robots", content: "index, follow" },
      
      // OpenGraph (Facebook / Discord / Telegram Previews)
      { property: "og:site_name", content: "CyaswTools" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "CyaswTools — Add Games to Steam Library Easily" },
      { 
        property: "og:description", 
        content: "The fast, modern, and lightweight utility for Steam game lovers. Add games to your Steam library in seconds." 
      },
      { property: "og:image", content: "/cysaw-fox.png" },
      
      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CyaswTools — Steam Game Utility" },
      { 
        name: "twitter:description", 
        content: "The fast, modern, and lightweight utility for Steam game lovers. Add games to your Steam library in seconds." 
      },
      { name: "twitter:image", content: "/cysaw-fox.png" },
    ],
    links: [
      // Favicons (Tab Icon / اللوقو في التبويب العلوي)
      { rel: "icon", type: "image/png", href: "/cysaw-fox.png" },
      { rel: "shortcut icon", type: "image/png", href: "/cysaw-fox.png" },
      { rel: "apple-touch-icon", href: "/cysaw-fox.png" },
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
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
