"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, ExternalLink, ShoppingBag } from "lucide-react";
import RichTooltip from "@/components/ui/rich-popover";

// Define the structured routine interfaces
export interface RoutineStep {
  id: number;
  productName: string;
  productImage: string;
  productLink: string;
  productPrice: number;
  why: string;
  how: string;
}

export interface RoutineSection {
  title: string;
  steps: RoutineStep[];
}

export interface RoutineDisplayProps {
  routines: RoutineSection[];
  summary?: string;
}

export function RoutineDisplay({ routines, summary }: RoutineDisplayProps) {
  console.log("[RoutineDisplay] Rendering with routines:", routines);
  console.log("[RoutineDisplay] Summary:", summary);

  if (!routines || routines.length === 0) {
    console.log("[RoutineDisplay] No routines to display");
    return null;
  }

  // Filter out "Summary" sections from routines as they should be displayed separately
  const actualRoutines = routines.filter(
    (routine) => !routine.title.toLowerCase().includes("summary")
  );

  return (
    <div className="flex justify-start mb-4">
      <div className="lg:max-w-[80%] max-w-[95%] py-3 border-b border-foreground/20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg mb-2">
            Your Skincare Routine by{" "}
            <strong className="text-foreground">Dr. Lavera</strong>
          </h1>
        </div>

        {/* Routine sections */}
        <div className="space-y-6">
          {actualRoutines.map((routine, routineIndex) => (
            <div key={`${routine.title}-${routineIndex}`} className="space-y-4">
              <h2 className="text-2xl font-semibold border-l-3 border-foreground  pl-2">
                {routine.title}
              </h2>
              {/* Routine steps */}
              <div className="space-y-4">
                {routine.steps.map((step) => (
                  <div
                    key={`${step.id}-${step.productName}`}
                    className="space-y-2 border-b border-foreground/20 pb-4"
                  >
                    {/* Step header with product */}
                    <div className="flex gap-2 font-semibold text-xl bg-foreground/10 px-2 py-1">
                      <p className="font-medium block text-nowrap">
                        Step {step.id}:
                      </p>

                      {/* Product with hover popover */}
                      <RichTooltip
                        trigger={
                          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="font-medium text-foreground hover:underline line-clamp-1">
                              {step.productName}
                            </span>
                            <div className="relative w-16 h-8 rounded-md overflow-hidden border-[1px] border-primary">
                              <img
                                src={step.productImage}
                                alt={step.productName}
                                className="object-cover w-full h-full object-center"
                              />
                            </div>
                          </div>
                        }
                        title={step.productName}
                        productImage={step.productImage}
                        description={`Perfect for your skincare routine. Click to purchase for $${step.productPrice.toFixed(
                          2
                        )}.`}
                        actionLabel="Buy Now"
                        actionHref={step.productLink}
                        meta={`$${step.productPrice.toFixed(2)}`}
                        side="top"
                        align="start"
                      />
                    </div>

                    {/* Why section */}
                    <div className="space-y-2  text-lg">
                      <div className="">
                        <span className="font-semibold text-foreground">
                          Why:{" "}
                        </span>
                        <span className="">{step.why}</span>
                      </div>

                      {/* How section */}
                      <div className="">
                        <span className="font-semibold text-foreground">
                          How:{" "}
                        </span>
                        <span className="">{step.how}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Display summary if available */}
          {summary && (
            <div className="mt-6 pt-4">
              <h4 className="text-2xl font-semibold text-foreground mb-2 border-l-3 border-foreground pl-2">
                Summary
              </h4>
              <p className="text-lg leading-relaxed">{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
