"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const Header = () => {
  const pathname = usePathname();

  const menus = [
    { name: "プロジェクト", href: "/" },
    { name: "メンバ", href: "/member" },
  ];

  return (
    <header className="bg-primary">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between px-8"
      >
        <div className="py-4">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-white text-lg">プロジェクト管理ツール</span>
          </Link>
        </div>

        <div className="flex gap-x-12 py-4">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={clsx(
                "text-sm/6 font-semibold border-b-2 transition duration-200",
                {
                  "text-white border-white": pathname === menu.href,
                  "text-white border-transparent hover:border-white":
                    pathname !== menu.href,
                }
              )}
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
