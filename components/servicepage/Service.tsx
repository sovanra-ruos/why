"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Cloud, Lock } from "lucide-react";
import IconCloudDemo from "@/components/servicepage/IconCloudDemo";
import TerminalPage from "@/components/servicepage/terminal";
import FeatureCard from "@/components/servicepage/FeatureCard";
import AnimatedBackground from "@/components/servicepage/AnimatedBackground";
import StorageSection from "@/components/servicepage/StorageSection";
import Link from "next/link";

export default function ServicesPage() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-900">
            <section className="relative overflow-hidden min-h-screen flex items-center">
                <AnimatedBackground />
                <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-4xl mx-auto"
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 md:mb-8">
                                <span className="text-purple-400">Learn How </span>
                                <span className="text-blue-500 dark:text-blue-400">
                                Cloudinator
                                </span>
                                <br className="hidden sm:inline" />
                                <span className="text-purple-400">Can Build Your Product </span>
                                <span className="text-blue-500 dark:text-blue-400">Fast</span>
                            </h1>

                            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
                                Unlock the incredible power of Cloudinator, revolutionizing
                                product development speed. Accelerate your process, embrace
                                rapid innovation, and experience a swift and efficient journey.
                                Discover Cloudinators potential today.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link href="/start-building">
                                    <Button
                                        size="lg"
                                        className="bg-purple-500 hover:bg-purple-700 text-white"
                                    >
                                        Get Started Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="dark:border-gray-500 dark:text-gray-300"
                                    onClick={() => setIsVideoOpen(true)}
                                >
                                    Watch Demo
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <FeatureCard
                                icon={<Zap className="h-8 w-8 text-yellow-400" />}
                                title="Lightning Fast Deployment"
                                description="Deploy your applications in seconds with our optimized CI/CD pipelines."
                            />
                            <FeatureCard
                                icon={<Cloud className="h-8 w-8 text-blue-400" />}
                                title="Scalable Cloud Infrastructure"
                                description="Easily scale your infrastructure up or down based on demand."
                            />
                            <FeatureCard
                                icon={<Lock className="h-8 w-8 text-green-400" />}
                                title="Enhanced Security"
                                description="Built-in security features to keep your applications and data safe."
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Rest of the sections remain unchanged */}
            <section className="py-16">
                <div className="container mx-auto px-4 flex justify-center">
                    <IconCloudDemo />
                </div>
            </section>

            <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <TerminalPage />
                </div>
            </section>

            <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <StorageSection />
                </div>
            </section>

            {isVideoOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full">
                        <div className="aspect-w-16 aspect-h-9">
                            <iframe
                                src="https://www.youtube.com/embed/kIpW8ZkfsYs"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                className="w-full h-[500px]"
                            ></iframe>
                        </div>
                        <Button
                            className="mt-4 dark:bg-gray-700 dark:text-gray-300 bg-purple-500"
                            onClick={() => setIsVideoOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
