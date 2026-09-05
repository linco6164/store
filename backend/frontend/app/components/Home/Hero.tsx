"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";

import  Button  from "../ui/Button";
import { Container } from "../layout";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50">

            <Container>

                <div className="flex min-h-[620px] items-center py-20">

                    <div className="max-w-3xl">

                        <motion.span
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
                        >
                            🚀 România's Modern Marketplace
                        </motion.span>

                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: .1,
                            }}
                            className="mt-8 text-5xl font-black leading-tight text-gray-900 lg:text-7xl"
                        >
                            Buy.
                            <br />

                            Sell.
                            <br />

                            Everything.
                        </motion.h1>

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: .2,
                            }}
                            className="mt-8 max-w-2xl text-xl leading-9 text-gray-600"
                        >
                            Discover thousands of products from verified sellers across Romania.
                            Fast. Secure. Modern.
                        </motion.p>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: .3,
                            }}
                            className="mt-10 flex flex-wrap gap-4"
                        >
                            <Button
                                size="lg"
                            >
                                <Search size={20} />

                                Explore

                            </Button>

                            <Link href="/sell">

                                <Button
                                    variant="outline"
                                    size="lg"
                                >
                                    Sell Now

                                    <ArrowRight
                                        size={18}
                                    />

                                </Button>

                            </Link>

                        </motion.div>

                    </div>

                </div>

            </Container>

        </section>
    );
}