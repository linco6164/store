"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Container } from "../layout";
import Button from "../ui/Button";

export default function PromoBanner() {
    return (
        <section className="py-20">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-8 py-16 text-white lg:px-16"
                >
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 mx-auto max-w-3xl text-center">

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                            <Sparkles size={18} />
                            <span className="text-sm font-semibold">
                                Join the Nexora community
                            </span>
                        </div>

                        <h2 className="text-4xl font-black leading-tight lg:text-5xl">
                            Sell what you no longer use.
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-50">
                            Reach thousands of buyers across Romania.
                            Create your listing in less than a minute and start selling today.
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-4">

                            <Link href="/sell">
                                <Button
                                    size="lg"
                                    className="bg-white text-emerald-700 hover:bg-gray-100"
                                >
                                    Start Selling

                                    <ArrowRight size={18} />
                                </Button>
                            </Link>

                            <Link href="/register">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-white text-white hover:bg-white/10"
                                >
                                    Create Account
                                </Button>
                            </Link>

                        </div>

                    </div>
                </motion.div>
            </Container>
        </section>
    );
}