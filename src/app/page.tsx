"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="min-h-screen flex items-center justify-center">
        <Button 
        onClick={() => {
          window.location.href = "/quiz";
        }}
        variant="outline" className="bg-background text-foreground hover:bg-foreground hover:text-background">
          <span>Start Quiz</span>
        </Button>
    </section>
  );
}
