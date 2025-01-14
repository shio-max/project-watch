"use client";

import Link from "next/link";

const Header = () => {
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
              className="text-sm/6 font-semibold text-white border-b-2 border-transparent hover:border-white transition duration-200"
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
