import HomePage from "@/components/homepage/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cloudinator | Unified Cloud Deployment & Microservices Platform",
    description: "Streamline your cloud development with Cloudinator. Deploy backend, frontend, and database services, create Spring-like projects, and manage microservices - all from one powerful platform.",
    keywords: [
        "cloud deployment",
        "microservices",
        "backend deployment",
        "frontend deployment",
        "database services",
        "DevOps",
        "Spring Initializer alternative",
        "cloud infrastructure",
        "serverless",
        "continuous deployment",
        "multi-cloud",
        "cloud-native",
        "ISTAD CLOUD INFRASTRUCTURE"
    ],
    authors: [{ name: "Cloudinator Team" }],
    creator: "Cloudinator",
    publisher: "Cloudinator",
    applicationName: "Cloudinator",
    referrer: "origin-when-cross-origin",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: "Cloudinator: Revolutionize Your Cloud Development Workflow",
        description: "Unify your cloud deployment process. Create, deploy, and manage backend, frontend, databases, and microservices with the efficiency of Spring Initializer and the power of a comprehensive cloud platform.",
        url: "https://cloudinator.istad.co",
        siteName: "Cloudinator",
        images: [
            {
                url: "https://cloudinator.istad.co/media/api/v1/medias/view/2f96e228-ff19-471a-8880-9188a3d2a387.png",
                width: 1200,
                height: 630,
                alt: "Cloudinator Platform - Unified Cloud Deployment",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },
    category: "Technology",
    classification: "Cloud Development Platform",
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function Home() {
    return (
        <>
            <HomePage />
        </>
    );
}

