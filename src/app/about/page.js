import {
  Mail,
  MapPin,
  Youtube,
  Facebook,
  Instagram,
  Phone,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-surface py-16 md:py-20 border-b border-border">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground tracking-tight">
              About Root to Nahid
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Empowering students to master mathematics with clarity and
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
                <p className="text-lg text-muted-foreground leading-relaxed">
                  <span className="font-bold text-primary">Root to Nahid</span>{" "}
                  is an innovative EdTech platform dedicated to helping BSc
                  Mathematics students of the National University, Bangladesh.
                  We guide you from the fundamental roots of mathematics to
                  advanced problem-solving with clarity and confidence.
                </p>

                <div className="grid gap-4 py-4">
                  <div className="flex gap-4 items-start">
                    <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">
                        National University Syllabus:
                      </strong>{" "}
                      Complete coverage of core topics with exam-focused
                      guidance.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">
                        Concept-Based Learning:
                      </strong>{" "}
                      Step-by-step explanations that make complex ideas easy to
                      understand.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">
                        Student Success:
                      </strong>{" "}
                      Build strong foundations and improve analytical skills for
                      your academic journey.
                    </p>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-md border-l-4 border-primary italic text-muted-foreground font-medium">
                  "Learn smart. Learn strong. Learn from the root — with Root to
                  Nahid."
                </div>
              </div>

              <div className="border-t border-dashed border-border my-8"></div>

              <h3 className="text-xl font-bold mb-4 text-foreground">
                Contact Information
              </h3>
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
            </div>

            {/* Links Section */}
            <div className="bg-card rounded-3xl  border border-border p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <span className="w-10 h-1 rounded-full bg-primary"></span>
                Official Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SocialLink
                  href="https://facebook.com/nahidislam.4373"
                  icon={<Facebook className="w-6 h-6" />}
                  title="Facebook Profile"
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <SocialLink
                  href="https://instagram.com/accounts/login"
                  icon={<Instagram className="w-6 h-6" />}
                  title="Instagram"
                  color="text-pink-600"
                  bgColor="bg-pink-50"
                />
                <SocialLink
                  href="https://facebook.com/roottonahid"
                  icon={<Facebook className="w-6 h-6" />}
                  title="Facebook Page"
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <SocialLink
                  href="https://facebook.com/groups/1142155663274990/?ref=share"
                  icon={<Facebook className="w-6 h-6" />}
                  title="Facebook Group"
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
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
                <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                    <Youtube size={18} />
                  </div>
                  <Link
                    href="https://www.youtube.com/@RoottoNahid"
                    target="_blank"
                    className="text-sm font-medium break-all"
                  >
                    www.youtube.com/@RoottoNahid
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
                    <Mail size={18} />
                  </div>
                  <span className="text-sm font-medium">
                    View email address
                  </span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-foreground shrink-0">
                    <Globe size={18} />
                  </div>
                  <Link
                    href="https://root-to-nahid.vercel.app"
                    target="_blank"
                    className="text-sm font-medium"
                  >
                    root-to-nahid.vercel.app
                  </Link>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <Link
                  href="https://www.youtube.com/@RoottoNahid?sub_confirmation=1"
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
