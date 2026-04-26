"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

function getErrorMessage(error: { message?: string } | null) {
  return error?.message || "Something went wrong. Please try again.";
}

export default function XmdxSignup() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!name || !email || !password) {
      toast.error("Fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsPending(true);

    const response = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/xmdx/login",
    });

    setIsPending(false);

    if (response.error) {
      toast.error(getErrorMessage(response.error));
      return;
    }

    toast.success("Account created.");
    router.push("/xmdx/login");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-sm rounded-md border border-border bg-card p-6 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            XMDX
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-card-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use your email and password to get started.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Please wait..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="/xmdx/login"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
