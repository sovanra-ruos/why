'use client';
import { useEffect, useState } from 'react';
import IconCloud from "@/components/ui/icon-cloud";

const slugs = [
    "typescript",
    "javascript",
    "java",
    "spring",
    "springboot",
    "react",
    "angular",
    "vue",
    "nextjs",
    "flutter",
    "android",
    "html5",
    "css3",
    "nodejs",
    "express",
    "jenkins",
    "kubernetes",
    "dart",
    "argocd",
    "java",
    "react",
    "flutter",
    "android",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    "prisma",
    "amazonaws",
    "postgresql",
    "firebase",
    "nginx",
    "vercel",
    "testinglibrary",
    "jest",
    "cypress",
    "docker",
    "git",
    "jira",
    "github",
    "gitlab",
    "visualstudiocode",
    "androidstudio",
    "sonarqube",
    "figma",
];

export function IconCloudDemo() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg  bg-background px-20 pb-20 pt-8  dark:bg-gray-900">
            <IconCloud iconSlugs={slugs} />
        </div>
    );
}

export default IconCloudDemo;