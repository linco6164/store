"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/cn";

interface StepperProps {
    currentStep: number;
    totalSteps: number;
}

const steps = [
    "Photos",
    "Details",
    "Category",
    "Price",
    "Location",
    "Publish",
];

export default function Stepper({
    currentStep,
    totalSteps,
}: StepperProps) {
    return (
        <div className="mb-10">

            <div className="mb-3 flex items-center justify-between">

                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Create Listing
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Step {currentStep} of {totalSteps}
                    </p>
                </div>

                <span className="text-sm font-semibold text-emerald-600">
                    {Math.round(
                        (currentStep / totalSteps) *
                            100
                    )}
                    %
                </span>

            </div>

            <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200">

                <motion.div
                    initial={{
                        width: 0,
                    }}
                    animate={{
                        width: `${
                            (currentStep /
                                totalSteps) *
                            100
                        }%`,
                    }}
                    transition={{
                        duration: .35,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />

            </div>

            <div className="grid grid-cols-6 gap-3">

                {steps.map(
                    (step, index) => {
                        const completed =
                            index + 1 <
                            currentStep;

                        const active =
                            index + 1 ===
                            currentStep;

                        return (
                            <div
                                key={step}
                                className="flex flex-col items-center"
                            >
                                <div
                                    className={cn(
                                        "flex h-11 w-11 items-center justify-center rounded-full border-2 font-semibold transition-all",

                                        completed &&
                                            "border-emerald-500 bg-emerald-500 text-white",

                                        active &&
                                            "border-emerald-500 bg-white text-emerald-600 shadow-lg",

                                        !completed &&
                                            !active &&
                                            "border-gray-300 bg-white text-gray-400"
                                    )}
                                >
                                    {completed ? (
                                        <Check
                                            size={
                                                18
                                            }
                                        />
                                    ) : (
                                        index +
                                        1
                                    )}
                                </div>

                                <span
                                    className={cn(
                                        "mt-3 text-center text-xs font-medium",

                                        active
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                    )}
                                >
                                    {step}
                                </span>

                            </div>
                        );
                    }
                )}

            </div>

        </div>
    );
}