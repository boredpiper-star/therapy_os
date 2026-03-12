'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Calendar, LayoutDashboard, LogOut, CalendarDays, ShieldCheck, Briefcase, BarChart3, Menu, X, Receipt, FilePlus } from "lucide-react"
import { cn } from "@/lib/utils" 
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "@/components/DarkModeToggle"

interface SidebarProps {
  role: string | undefined
}

export default function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // --- ROLE DEFINITIONS ---
  const isTherapist = role === 'therapist' || role === 'doctor'
  const isSuperAdmin = role === 'super_admin'
  const isAdminUser = role === 'admin_user'
  
  // --- PERMISSIONS ---
  const canSeeCommandCenter = isSuperAdmin
  const canManageTeam = isSuperAdmin || isAdminUser
  const canManageBilling = isSuperAdmin || isAdminUser // Billing permissions

  // Helper to close menu when a link is clicked
  const handleLinkClick = () => setIsOpen(false)

  return (
    <>
      {/* MOBILE TRIGGER (Visible only on small screens) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-md dark:bg-slate-900">
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* OVERLAY (Background dimming on mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-white px-6 py-6 transition-transform duration-300 md:translate-x-0 dark:bg-slate-950 dark:border-slate-800",
        // Mobile behavior: Slide in if open, slide out if closed.
        // Desktop behavior (md:): Always reset to 0 (visible).
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-8 dark:text-slate-100 pl-2 md:pl-0">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
             <ShieldCheck className="text-white w-5 h-5" />
          </div>
          TherapyOps
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          
          {/* === VIEW 1: THERAPIST ONLY === */}
          {isTherapist && (
            <>
              <div className="pb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</p>
              </div>
              <NavLink href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Overview" activePath={pathname} onClick={handleLinkClick} />
              <NavLink href="/dashboard/calendar" icon={<CalendarDays size={20}/>} label="My Calendar" activePath={pathname} onClick={handleLinkClick} />
            </>
          )}

          {/* === VIEW 2: ADMIN STAFF === */}
          {!isTherapist && (
            <>
              <div className="pb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Front Desk</p>
              </div>

              {canSeeCommandCenter && (
                 <NavLink href="/dashboard" icon={<BarChart3 size={20}/>} label="Command Center" activePath={pathname} onClick={handleLinkClick} />
              )}

              <NavLink href="/dashboard/schedule" icon={<Calendar size={20}/>} label="Clinic Schedule" activePath={pathname} onClick={handleLinkClick} />
              <NavLink href="/dashboard/patients" icon={<Users size={20}/>} label="Patients" activePath={pathname} onClick={handleLinkClick} /> 
              
              {/* BILLING LINKS */}
              {canManageBilling && (
                 <>
                   <NavLink href="/dashboard/billing" icon={<Receipt size={20}/>} label="Automated Billing" activePath={pathname} onClick={handleLinkClick} />
                   <NavLink href="/dashboard/create-invoice" icon={<FilePlus size={20}/>} label="Create Invoice" activePath={pathname} onClick={handleLinkClick} />
                 </>
              )}
              
              {canManageTeam && (
                 <NavLink href="/dashboard/team" icon={<Briefcase size={20}/>} label="Team Management" activePath={pathname} onClick={handleLinkClick} />
              )}

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                 <DarkModeToggle />
              </div>
            </>
          )}

        </nav>

        <div className="border-t pt-4 dark:border-slate-800">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20">
              <LogOut size={20} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

function NavLink({ href, icon, label, activePath, onClick }: { href: string; icon: React.ReactNode; label: string, activePath: string, onClick: () => void }) {
  // Uses startsWith so the tab stays highlighted even when viewing a specific invoice
  const isActive = activePath === href || (href !== '/dashboard' && activePath.startsWith(href))
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive 
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}