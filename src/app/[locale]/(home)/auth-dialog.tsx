"use client";

import { OauthSection } from "@/app/[locale]/(home)/oauth-section";
import { getPlanFeatures } from "@/app/[locale]/(main)/pricing/plan";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AuthDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl p-8">
        <DialogHeader className="space-y-6">
          <DialogTitle className="text-2xl font-semibold">
            Sign in to Formula Generator
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Sign in to protect our service from abuse and access your free daily
            quota:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {getPlanFeatures("Free").map((text) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-sm text-emerald-600">✓</span>
              </div>
              <span className="text-gray-600">{text}</span>
            </div>
          ))}
        </div>
        <OauthSection className="mt-6" />
      </DialogContent>
    </Dialog>
  );
}
