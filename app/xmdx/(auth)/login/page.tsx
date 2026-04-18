"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { canUseXmdxPassword } from "./actions";

function getErrorMessage(error: { message?: string } | null) {
  return error?.message || "Something went wrong. Please try again.";
}

export default function XmdxLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email) {
      toast.error("Enter your email.");
      return;
    }

    const emailCheck = await canUseXmdxPassword(email);

    if (!emailCheck.configured) {
      toast.error("Email is not configured.");
      return;
    }

    if (!emailCheck.allowed) {
      setShowPassword(false);
      toast.error("Wrong credentials.");
      return;
    }

    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    if (!password) {
      toast.error("Enter your password.");
      return;
    }

    setIsPending(true);

    const response = await signIn.email({
      email,
      password,
      callbackURL: "/xmdx/editor",
    });

    setIsPending(false);

    if (response.error) {
      toast.error(getErrorMessage(response.error));
      return;
    }

    toast.success("Signed in.");
    router.push("/xmdx/editor");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-sm p-6 shadow-sm">
        <div className="text-center">
          <h1 className="mt-3 text-2xl font-medium tracking-normal text-card-foreground">
            Login to your account
          </h1>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setShowPassword(false);
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          {showPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                required
              />
            </div>
          )}

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Please wait..." : showPassword ? "Login" : "Continue"}
          </Button>
        </form>

        {/* <p className="mt-5 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="/xmdx/signup"
          >
            Sign up
          </Link>
        </p> */}
      </section>
    </main>
  );
}
