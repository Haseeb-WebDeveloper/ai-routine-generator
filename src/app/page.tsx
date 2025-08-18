"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="min-h-screen flex items-center justify-center flex-col gap-4">
        <Button 
        onClick={() => {
          window.location.href = "/quiz";
        }}
        variant="outline" className="bg-background text-foreground hover:bg-foreground hover:text-background">
          <span>Start Quiz</span>
        </Button>

        {/* <iframe src="/quiz" className="w-full h-full min-h-[500px]"></iframe> */}
    </section>
  );
}
