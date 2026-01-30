"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";
import {
  Save,
  Loader2,
  LayoutTemplate,
  Info,
  Phone,
  Link as LinkIcon,
  Plus,
  Trash2,
  Image as ImageIcon,
  Globe,
} from "lucide-react";

export default function SiteConfigEditor() {
  const [activeTab, setActiveTab] = useState("banner");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [bannerData, setBannerData] = useState({
    title: "",
    subtitle: "",
    logoUrl: "",
  });

  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    bulletPoints: [],
  });

  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
    address: "",
  });

  const [linksData, setLinksData] = useState([]);

  const [moreInfoData, setMoreInfoData] = useState({
    youtubeChannel: "",
    websiteUrl: "",
    location: "",
    subscribeButtonText: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, aboutRes, contactRes, linksRes, moreInfoRes] =
          await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/banner`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/about`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/contact`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/links`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/config/moreInfo`),
          ]);

        if (bannerRes.data && Object.keys(bannerRes.data).length > 0) {
          setBannerData((prev) => ({ ...prev, ...bannerRes.data }));
        } else {
          setBannerData({
            title: "Learn Smarter\nwith Root Over Education",
            subtitle:
              "Empowering students to master science subjects with clarity and confidence.",
            logoUrl: "",
          });
        }

        if (aboutRes.data && Object.keys(aboutRes.data).length > 0) {
          setAboutData((prev) => ({
            ...prev,
            ...aboutRes.data,
            bulletPoints: aboutRes.data.bulletPoints || [],
          }));
        } else {
          setAboutData({
            title: "About Root Over Education",
            description:
              "Root Over Education is an innovative EdTech platform dedicated to helping SSC, HSC, and BSc Science students.",
            bulletPoints: [],
          });
        }

        if (contactRes.data && Object.keys(contactRes.data).length > 0) {
          setContactData(contactRes.data);
        }

        if (linksRes.data && Array.isArray(linksRes.data)) {
          setLinksData(linksRes.data);
        }

        if (moreInfoRes.data && Object.keys(moreInfoRes.data).length > 0) {
          setMoreInfoData(moreInfoRes.data);
        } else {
          setMoreInfoData({
            youtubeChannel: "https://www.youtube.com/@RootOverEducation",
            websiteUrl: "https://rootover.vercel.app",
            location: "Bangladesh",
            subscribeButtonText: "Subscribe Now",
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      let configToSave;

      switch (activeTab) {
        case "banner":
          configToSave = { key: "banner", value: bannerData };
          break;
        case "about":
          configToSave = { key: "about", value: aboutData };
          break;
        case "contact":
          configToSave = { key: "contact", value: contactData };
          break;
        case "links":
          configToSave = { key: "links", value: linksData };
          break;
        case "moreInfo":
          configToSave = { key: "moreInfo", value: moreInfoData };
          break;
        default:
          return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`,
        configToSave,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `${activeTab === "moreInfo" ? "More Info" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings updated successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving config:", error);
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const addBulletPoint = () => {
    setAboutData({
      ...aboutData,
      bulletPoints: [...aboutData.bulletPoints, { title: "", text: "" }],
    });
  };

  const updateBulletPoint = (index, field, value) => {
    const newPoints = [...aboutData.bulletPoints];
    newPoints[index][field] = value;
    setAboutData({ ...aboutData, bulletPoints: newPoints });
  };

  const removeBulletPoint = (index) => {
    const newPoints = aboutData.bulletPoints.filter((_, i) => i !== index);
    setAboutData({ ...aboutData, bulletPoints: newPoints });
  };

  const addLink = () => {
    setLinksData([...linksData, { label: "", url: "" }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...linksData];
    newLinks[index][field] = value;
    setLinksData(newLinks);
  };

  const removeLink = (index) => {
    const newLinks = linksData.filter((_, i) => i !== index);
    setLinksData(newLinks);
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "banner", label: "Home Banner", icon: LayoutTemplate },
    { id: "about", label: "About & Info", icon: Info },
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "links", label: "Official Links", icon: LinkIcon },
    { id: "moreInfo", label: "More Info", icon: Globe },
  ];

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      {/* Tab Header */}
      <div className="border-b border-border bg-muted/10 p-3 md:p-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-md text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon size={16} className="shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* BANNER TAB */}
          {activeTab === "banner" && (
            <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Banner Title
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  rows="2"
                  value={bannerData.title}
                  onChange={(e) =>
                    setBannerData({ ...bannerData, title: e.target.value })
                  }
                  placeholder="Enter banner title..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Hero / Subtitle Text
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  rows="3"
                  value={bannerData.subtitle}
                  onChange={(e) =>
                    setBannerData({ ...bannerData, subtitle: e.target.value })
                  }
                  placeholder="Empowering students to master science..."
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  This is the main hero text displayed below the title.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                  <ImageIcon size={16} />
                  Logo URL
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={bannerData.logoUrl}
                  onChange={(e) =>
                    setBannerData({ ...bannerData, logoUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
                {bannerData.logoUrl && (
                  <div className="mt-3 p-3 border border-border rounded-md bg-muted/20 w-fit">
                    <p className="text-xs text-muted-foreground mb-2">
                      Preview:
                    </p>
                    <img
                      src={bannerData.logoUrl}
                      alt="Logo Preview"
                      className="h-12 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={aboutData.title}
                  onChange={(e) =>
                    setAboutData({ ...aboutData, title: e.target.value })
                  }
                  placeholder="About Root Over Education"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Main Description
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none min-h-[120px]"
                  value={aboutData.description}
                  onChange={(e) =>
                    setAboutData({ ...aboutData, description: e.target.value })
                  }
                  placeholder="Describe your platform's mission..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <label className="block text-sm font-bold text-foreground">
                    Detailed Bullet Points
                  </label>
                  <button
                    onClick={addBulletPoint}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-md border border-border bg-background hover:bg-muted transition-all w-full sm:w-auto"
                  >
                    <Plus size={14} />
                    <span>Add Point</span>
                  </button>
                </div>

                {aboutData.bulletPoints.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground bg-muted/10 rounded-md border border-dashed border-border">
                    No points added yet. Add one to describe specific features
                    or values.
                  </div>
                )}

                <div className="space-y-3">
                  {aboutData.bulletPoints.map((point, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-md border border-border bg-muted/5 relative group"
                    >
                      <button
                        onClick={() => removeBulletPoint(index)}
                        className="absolute top-3 right-3 p-1.5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="space-y-3 pr-8">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            Point Title
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="e.g. Expert Mentors"
                            value={point.title}
                            onChange={(e) =>
                              updateBulletPoint(index, "title", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            Sub-text / Detail
                          </label>
                          <textarea
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            rows="2"
                            placeholder="e.g. Learn from the best minds..."
                            value={point.text}
                            onChange={(e) =>
                              updateBulletPoint(index, "text", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === "contact" && (
            <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={contactData.email}
                  onChange={(e) =>
                    setContactData({ ...contactData, email: e.target.value })
                  }
                  placeholder="contact@rootover.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={contactData.phone}
                  onChange={(e) =>
                    setContactData({ ...contactData, phone: e.target.value })
                  }
                  placeholder="+880 1234 567890"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Office Address
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  rows="3"
                  value={contactData.address}
                  onChange={(e) =>
                    setContactData({ ...contactData, address: e.target.value })
                  }
                  placeholder="Full physical address..."
                />
              </div>
            </div>
          )}

          {/* LINKS TAB */}
          {activeTab === "links" && (
            <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <label className="block text-sm font-bold text-foreground">
                  Social & Official Links
                </label>
                <button
                  onClick={addLink}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-md border border-border bg-background hover:bg-muted transition-all w-full sm:w-auto"
                >
                  <Plus size={14} />
                  <span>Add New Link</span>
                </button>
              </div>

              {linksData.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground bg-muted/10 rounded-md border border-dashed border-border">
                  No links added yet. Add links to Facebook, YouTube, LinkedIn
                  etc.
                </div>
              )}

              <div className="space-y-3">
                {linksData.map((link, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 p-3 rounded-md border border-border bg-muted/5"
                  >
                    <div className="flex-1 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Label (e.g. Facebook)"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(index, "label", e.target.value)
                        }
                      />
                      <div className="sm:col-span-2">
                        <input
                          type="url"
                          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="URL (https://...)"
                          value={link.url}
                          onChange={(e) =>
                            updateLink(index, "url", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeLink(index)}
                      className="flex items-center justify-center w-full sm:w-10 h-10 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all shrink-0"
                      title="Remove link"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MORE INFO TAB */}
          {activeTab === "moreInfo" && (
            <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={moreInfoData.youtubeChannel}
                  onChange={(e) =>
                    setMoreInfoData({
                      ...moreInfoData,
                      youtubeChannel: e.target.value,
                    })
                  }
                  placeholder="https://www.youtube.com/@YourChannel"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Full URL to your YouTube channel
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={moreInfoData.websiteUrl}
                  onChange={(e) =>
                    setMoreInfoData({
                      ...moreInfoData,
                      websiteUrl: e.target.value,
                    })
                  }
                  placeholder="https://yourwebsite.com"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Your main website URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={moreInfoData.location}
                  onChange={(e) =>
                    setMoreInfoData({
                      ...moreInfoData,
                      location: e.target.value,
                    })
                  }
                  placeholder="Bangladesh"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Country or city location
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Subscribe Button Text
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={moreInfoData.subscribeButtonText}
                  onChange={(e) =>
                    setMoreInfoData({
                      ...moreInfoData,
                      subscribeButtonText: e.target.value,
                    })
                  }
                  placeholder="Subscribe Now"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Text shown on the YouTube subscribe button
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto min-w-[160px]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              <span>
                Save{" "}
                {activeTab === "moreInfo"
                  ? "More Info"
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
