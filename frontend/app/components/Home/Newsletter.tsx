"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { Container } from "../layout";
import Button from "../ui/Button";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] =
        useState(false);

    function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        if (!email.trim()) return;

        // TODO:
        // Newsletter API

        setSuccess(true);
        setEmail("");

        setTimeout(() => {
            setSuccess(false);
        }, 3000);
    }

    return (
        <section className="py-24 bg-gray-50">

            <Container>

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        duration: .4,
                    }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">

                        <Mail
                            size={36}
                            className="text-emerald-600"
                        />

                    </div>

                    <h2 className="text-4xl font-bold">
                        Never miss a great deal
                    </h2>

                    <p className="mt-5 text-lg text-gray-500">
                        Subscribe to receive new listings,
                        exclusive offers and marketplace news.
                    </p>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="mt-10 flex flex-col gap-4 sm:flex-row"
                    >
                        <input
                            type="email"
                            placeholder="Your email..."
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            className="h-14 flex-1 rounded-2xl border border-gray-200 bg-white px-5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />

                        <Button
                            size="lg"
                            type="submit"
                        >
                            Subscribe
                        </Button>

                    </form>

                    {success && (

                        <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600">

                            <CheckCircle2
                                size={20}
                            />

                            <span>
                                Successfully subscribed!
                            </span>

                        </div>

                    )}

                </motion.div>

            </Container>

        </section>
    );
}