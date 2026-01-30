"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Mail,
  MapPin,
  Youtube,
  ShieldCheck,
  Target,
  Users,
  ArrowRight,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import LoadingAnimation from "@/components/LoadingAnimation";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [aboutData, setAboutData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [linksData, setLinksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [aboutRes, contactRes, linksRes] = await Promise.allSettled([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/about`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/contact`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/links`),
        ]);

        // Handle About Data
        if (
          aboutRes.status === "fulfilled" &&
          aboutRes.value.data &&
          Object.keys(aboutRes.value.data).length > 0
        ) {
          setAboutData(aboutRes.value.data);
        } else {
          setAboutData({
            title: "About Root Over Education",
            description:
              "Root Over Education is an innovative EdTech platform dedicated to helping SSC, HSC, and BSc Science students. We guide you from the fundamental roots of science to advanced problem-solving with clarity and confidence.",
            bulletPoints: [],
          });
        }

        // Handle Contact Data
        if (
          contactRes.status === "fulfilled" &&
          contactRes.value.data &&
          Object.keys(contactRes.value.data).length > 0
        ) {
          setContactData(contactRes.value.data);
        }

        // Handle Links Data
        if (
          linksRes.status === "fulfilled" &&
          Array.isArray(linksRes.value.data)
        ) {
          setLinksData(linksRes.value.data);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return <LoadingAnimation />;
  }

  // Fallback for bullet points if empty
  const bulletPoints =
    aboutData?.bulletPoints && aboutData.bulletPoints.length > 0
      ? aboutData.bulletPoints
      : [
          {
            title: "National University Syllabus",
            text: "Complete coverage of core topics with exam-focused guidance.",
          },
          {
            title: "Concept-Based Learning",
            text: "Step-by-step explanations that make complex scientific ideas easy to understand.",
          },
          {
            title: "Student Success",
            text: "Build strong foundations and improve analytical skills for your academic journey.",
          },
        ];

  // Helper to find specific social links for icons
  const getSocialIcon = (url) => {
    if (url.includes("facebook")) return <Facebook className="w-6 h-6" />;
    if (url.includes("instagram")) return <Instagram className="w-6 h-6" />;
    if (url.includes("youtube")) return <Youtube className="w-6 h-6" />;
    return <LinkIcon className="w-6 h-6" />;
  };

  const getSocialColor = (url) => {
    if (url.includes("facebook")) return "text-blue-600 bg-blue-50";
    if (url.includes("instagram")) return "text-pink-600 bg-pink-50";
    if (url.includes("youtube")) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-surface py-16 md:py-20 border-b border-border">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 1 }}
              className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground tracking-tight h-[1.2em]"
            >
              {(aboutData?.title || "About Root Over Education")
                .split("")
                .map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.1,
                      delay: index * 0.04,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
            </motion.h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Empowering students to master science subjects with clarity and
              confidence.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom  ">
        <div className="grid grid-cols-1 mt-20 md:grid-cols-3 gap-8">
          {/* Main Content Card */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card rounded-3xl  border border-border p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-10 h-1 rounded-full bg-primary"></span>
                Description
              </h2>
              <div className="space-y-6">
                <div
                  className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: aboutData?.description }}
                />

                <div className="grid gap-4 py-4">
                  {bulletPoints.map((point, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">
                          {point.title}:
                        </strong>{" "}
                        {point.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-surface p-6 rounded-md border-l-4 border-primary italic text-muted-foreground font-medium">
                  "Learn smart. Learn strong. Learn from the root — with Root
                  Over Education."
                </div>
              </div>

              <div className="border-t border-dashed border-border my-8"></div>

              <h3 className="text-xl font-bold mb-4 text-foreground">
                Contact Information
              </h3>
              <div className="grid gap-4">
                {contactData?.phone ? (
                  <div className="bg-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 border border-border">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone / WhatsApp
                      </p>
                      <p className="text-xl font-bold text-foreground select-all">
                        {contactData.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Fallback
                  <div className="bg-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 border border-border">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        WhatsApp Number
                      </p>
                      <p className="text-xl font-bold text-foreground select-all">
                        01316271902
                      </p>
                    </div>
                  </div>
                )}

                {contactData?.address && (
                  <div className="bg-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 border border-border">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Office Address
                      </p>
                      <p className="text-md font-bold text-foreground">
                        {contactData.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links Section */}
            <div className="bg-card rounded-3xl  border border-border p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <span className="w-10 h-1 rounded-full bg-primary"></span>
                Official Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {linksData.length > 0 ? (
                  linksData.map((link, index) => {
                    const colorClass = getSocialColor(link.url);
                    // extract color and bg from the combined string manually if needed, or just use inline styles in helper
                    // defaulting to a simpler approach for the helper above
                    const [textColor, bgColor] = colorClass.split(" ");

                    return (
                      <SocialLink
                        key={index}
                        href={link.url}
                        icon={getSocialIcon(link.url)}
                        title={link.label}
                        color={textColor}
                        bgColor={bgColor}
                      />
                    );
                  })
                ) : (
                  <>
                    <SocialLink
                      href="https://facebook.com/nahidislam.4373"
                      icon={<Facebook className="w-6 h-6" />}
                      title="Facebook Profile"
                      color="text-blue-600"
                      bgColor="bg-blue-50"
                    />
                    <SocialLink
                      href="https://facebook.com/rootovereducation"
                      icon={<Facebook className="w-6 h-6" />}
                      title="Facebook Page"
                      color="text-blue-600"
                      bgColor="bg-blue-50"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl border border-border sticky top-24 p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">
                More Info
              </h3>

              <ul className="space-y-4">
                {contactData?.email ? (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-foreground shrink-0">
                      <Mail size={18} />
                    </div>
                    <a
                      href={`mailto:${contactData.email}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {contactData.email}
                    </a>
                  </li>
                ) : (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-foreground shrink-0">
                      <Mail size={18} />
                    </div>
                    <span className="text-sm font-medium">
                      View email address
                    </span>
                  </li>
                )}

                <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                    <Youtube size={18} />
                  </div>
                  <Link
                    href="https://www.youtube.com/@RootOverEducation"
                    target="_blank"
                    className="text-sm font-medium break-all"
                  >
                    www.youtube.com/@RootOverEducation
                  </Link>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-foreground shrink-0">
                    <MapPin size={18} />
                  </div>
                  <span className="text-sm font-medium">Bangladesh</span>
                </li>

                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-foreground shrink-0">
                    <Globe size={18} />
                  </div>
                  <Link
                    href="https://rootover.vercel.app"
                    target="_blank"
                    className="text-sm font-medium"
                  >
                    rootover.vercel.app
                  </Link>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <Link
                  href="https://www.youtube.com/@RootOverEducation?sub_confirmation=1"
                  target="_blank"
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground border-none  flex justify-center items-center gap-2 py-3 rounded-md font-bold transition-all"
                >
                  <Youtube size={20} />
                  Subscribe Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon, title, color, bgColor }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="flex items-center gap-4 p-4 rounded-md border border-border hover:border-primary/30 hover:shadow-md transition-all group bg-card"
    >
      <div
        className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground">View Profile</span>
      </div>
    </Link>
  );
}
