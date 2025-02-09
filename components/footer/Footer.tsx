"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Phone } from "lucide-react";

const navigation = {
  links: [
    { name: "Home", href: "/" },
    { name: "Service", href: "/service" },
    { name: "Document", href: "https://doc.cloudinator.cloud/" },
    { name: "Start Building", href: "/start-building" },
    { name: "About Us", href: "/about" },
  ],
};

const contact = {
  phone: "+85595990910",
  email: "info.istad@gmail.com",
  address:
    "No. 24, Street 562 ,Sangkat Boeung Kok, Toul Kork, Phnom Penh City.",
  mapUrl: "https://maps.app.goo.gl/HRN4hrCyrAqTdZzP6",
};

const partners = [
  {
    name: "MPTC",
    src: "/mptc.png",
    linkUrl: "https://mptc.gov.kh/",
    height: 210,
    width: 210,
  },
  {
    name: "CBRD",
    src: "/cbrd.png",
    linkUrl: "http://www.cbrd.com.kh/",
    height: 200,
    width: 200,
  },
  {
    name: "ISTAD",
    src: "/istad-logo.png",
    linkUrl: "https://www.cstad.edu.kh/",
    height: 185,
    width: 185,
  },
];


export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t py-10">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Logo & Description - Centered on mobile */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="w-48 h-48 relative mb-4">
              <Image
                src="/cloudinator-v2.1.png"
                alt="Cloudinator Logo"
                layout="fill"
                objectFit="contain"
                className="transition-transform hover:scale-105"
              />
            </div>
            <p className="text-purple-500 font-semibold text-sm max-w-[200px]">
              Empowering your cloud journey with simplicity and innovation
            </p>
          </div>

          {/* Navigation Links - Centered on mobile */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-purple-500 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navigation.links.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Centered on mobile */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-purple-500 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Phone className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Mail className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start justify-center md:justify-start space-x-3">
                <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                <a
                  href={contact.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                >
                  {contact.address}
                </a>
              </li>
            </ul>
          </div>

          {/* Partners - Centered grid */}
          <div className="space-y-4 grid place-content-center">
            <h3 className="text-lg font-semibold text-purple-500 mb-4 text-center">
              Sponsor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4 place-items-center">
              {partners.map((partner) => (
                <div key={partner.name} className="w-26 h-26 relative">
                  <Link href={partner.linkUrl} target="_blank">
                    <Image
                      src={partner.src}
                      alt={partner.name}
                      width={partner.width}
                      height={partner.height}
                      className="rounded-lg transition-transform hover:scale-105"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Footer Bottom - Always centered */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            <Link
              href="https://www.cstad.edu.kh/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            >
              Cloudinator by ISTAD
            </Link>
            . All rights reserved.™
          </p>
        </div>
      </Container>
    </footer>
  );
}
