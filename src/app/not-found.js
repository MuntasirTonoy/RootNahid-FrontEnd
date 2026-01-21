"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import notFoundAnimation from "../../public/Error 404 Page.json";

export default function NotFound() {
  return (
    <div className=" flex items-center justify-center bg-base-100 px-4 sm:px-6 lg:px-5 lg:mb-10">
      <div className="flex flex-col items-center text-center max-w-2xl w-full">
        {/* Animation */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-5 sm:mb-8">
          <Lottie
            animationData={notFoundAnimation}
            loop
            className="w-full h-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-base-content/70 max-w-md sm:max-w-lg mb-8 leading-relaxed">
          Oops! The page you’re looking for doesn’t exist, may have been moved,
          or the URL might be incorrect.
        </p>

        {/* CTA Button */}
        <Link
          href="/"
          className="btn btn-primary px-8 sm:px-10 py-3 rounded-md text-base sm:text-lg font-semibold
                      bg-primary  hover:bg-primary/80 hover:shadow-primary/20
                     hover:-translate-y-1 transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
