import type { Metadata } from "next";
import ServicesPage from "@/components/servicepage/Service";

export const metadata: Metadata = {
    title: "Cloudinator Services | Comprehensive Cloud Solutions",
    description: "Explore Cloudinator's suite of cloud services including backend, frontend, and database deployment, microservices management, and Spring-like project initialization. Streamline your cloud infrastructure with our all-in-one platform.",
    keywords: [
        "Cloudinator services",
        "cloud deployment",
        "microservices management",
        "backend services",
        "frontend deployment",
        "database services",
        "Spring-like initialization",
        "DevOps solutions"
    ],
    openGraph: {
        title: "Cloudinator Services: Your Complete Cloud Deployment Toolkit",
        description: "Discover how Cloudinator's comprehensive services can revolutionize your cloud infrastructure. From backend to frontend, databases to microservices - we've got you covered.",
        url: "https://cloudinator.istad.co/service",
        siteName: "Cloudinator",
        images: [
            {
                url: "https://cloudinator.istad.co/media/api/v1/medias/view/2f96e228-ff19-471a-8880-9188a3d2a387.png",
                width: 1200,
                height: 630,
                alt: "Cloudinator Services Overview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    alternates: {
        canonical: "https://cloudinator.istad.co/service",
    },
};

export default function Services() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-purple-100">
            <ServicesPage />
        </main>
    );
}

