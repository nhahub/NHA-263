import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl px-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            HR System
          </h1>
          <p className="text-lg text-muted-foreground">
            Human Resources Management System
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Register</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
