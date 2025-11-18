'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'home' },
  { href: '/purchases', label: 'purchases' },
  { href: '/products', label: 'products' },
  { href: '/marketing', label: 'marketing' },
  { href: '/customer', label: 'customers' },
  { href: '/employees', label: 'employees' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Logo"
            width={72}
            height={16}
          />
          <span className="text-lg font-semibold tracking-wide">
            InsightEdge
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'rounded-full bg-black px-3 py-1 text-white dark:bg-white dark:text-black'
                    : 'px-3 py-1 opacity-70 hover:opacity-100'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
