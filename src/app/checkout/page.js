"use client";
import { use, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowRight,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  X,
} from "lucide-react";

export default function CheckoutPage({ searchParams }) {
  // Await searchParams in Next.js 15
  return <CheckoutContent searchParams={searchParams} />;
}

function CheckoutContent({ searchParams }) {
  const sp = use(searchParams);
  const router = useRouter();
  const { user } = useAuth();
  const courseId = sp?.courseId;
  const subjectIds = sp?.subjects ? sp.subjects.split(",") : [];

  const [course, setCourse] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
        );
        const data = response.data;
        setCourse(data);

        // Filter selected subjects
        const subjects = data.subjects.filter((s) =>
          subjectIds.includes(s._id),
        );
        setSelectedSubjects(subjects);
      } catch (error) {
        console.error("Failed to fetch checkout data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, subjectIds]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase`,
        { subjectIds: selectedSubjects.map((s) => s._id) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        title: "Purchase Successful!",
        text: "You can now access your courses.",
        icon: "success",
      }).then(() => {
        router.push("/my-classes"); // Redirect to my classes
      });
    } catch (error) {
      console.error("Payment failed:", error);
      Swal.fire("Error", "Payment processing failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = selectedSubjects.reduce(
    (acc, curr) => acc + (curr.offerPrice || curr.price || 0),
    0,
  );
  const total = subtotal;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading checkout...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Invalid Course
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-background py-6">
          <div className="container-custom flex justify-between items-center">
            <Link
              href={`/course/${courseId}`}
              className="p-2 rounded-full bg-surface text-muted-foreground hover:text-foreground transition-colors absolute right-4 top-4"
            >
              <X className="w-6 h-6" />
            </Link>
          </div>
        </div>

        <main className="flex-1 container-custom py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-gray-500">
              Complete your information to enroll in the selected courses.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column: Forms */}
            <div className="flex-1 space-y-12">
              {/* Billing Info */}
              <section>
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary" /> Billing
                  Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.displayName}
                      className="w-full text-lg p-4 rounded-md border border-transparent bg-gray-50 dark:bg-surface dark:text-foreground outline-none focus:bg-white dark:focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full text-lg p-4 rounded-md border border-transparent bg-gray-50 dark:bg-surface dark:text-foreground outline-none focus:bg-white dark:focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-muted-foreground mb-2">
                      Phone Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-transparent bg-gray-50 dark:bg-surface text-gray-600 dark:text-muted-foreground font-bold">
                        +880
                      </span>
                      <input
                        type="tel"
                        placeholder="1XXXXXXXXX"
                        className="flex-1 text-lg p-4 rounded-r-xl border border-transparent bg-gray-50 dark:bg-surface dark:text-foreground outline-none focus:bg-white dark:focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* bKash */}
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      className="peer sr-only"
                      defaultChecked
                    />
                    <div className="p-4 rounded-md border-2 border-border dark:border-border peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all h-full relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-foreground">bKash</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-primary peer-checked:bg-primary transition-all" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Mobile Wallet
                      </span>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      className="peer sr-only"
                    />
                    <div className="p-4 rounded-md border-2 border-border dark:border-border peer-checked:border-primary peer-checked:bg-green-50/50 dark:peer-checked:bg-primary/10 transition-all h-full relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-foreground">Nagad</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-primary peer-checked:bg-primary transition-all" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Mobile Wallet
                      </span>
                    </div>
                  </label>

                  {/* Card */}
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      className="peer sr-only"
                    />
                    <div className="p-4 rounded-md border-2 border-border dark:border-border peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all h-full relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-foreground">Card</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-primary peer-checked:bg-primary transition-all" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Visa / Master
                      </span>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full bg-light lg:w-[400px]">
              <div className="bg-card rounded-3xl p-8 border border-border sticky top-24 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Order Summary
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  {course.title}
                </p>

                <div className="space-y-4 mb-8">
                  {selectedSubjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <p className="font-bold text-foreground">
                          {subject.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Subject Course
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {subject.offerPrice || subject.price} TK
                        </p>
                        {subject.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {subject.originalPrice} TK
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-border py-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">
                      {subtotal} TK
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span className="font-bold text-foreground">0 TK</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-md md:text-lg font-bold text-foreground">
                    Total Amount
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-4xl font-black text-primary leading-none">
                      {total}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-muted-foreground">
                      TK
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold text-md md:text-lg rounded-md hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                  {processing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Pay Now</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                  <Lock className="w-3 h-3" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
