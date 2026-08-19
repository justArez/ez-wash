/**
 * HeroBanner Component - Hero section with value proposition and CTA
 * Feature: 004-homepage-shadcn-redesign - User Story 3
 *
 * Displays:
 * - Hero banner with background image/gradient
 * - Value proposition text
 * - Primary CTA button
 * - Responsive text sizing
 */

import React from "react";
import type { HeroBannerProps } from "../../types/homepage.types";
import "./hero-banner.component.scss";

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onCtaClick,
  title = "Smart Automated Wash - Book Ahead, Skip the Line!",
  subtitle = "Reserve your preferred car wash time slot and enjoy a seamless experience",
}) => {
  return (
    <div
      className="relative w-full py-12 sm:py-16 lg:py-24 px-6 sm:px-8 lg:px-12 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 shadow-md"
      style={{
        backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.9), rgba(30, 58, 138, 0.9))`,
      }}
      role="banner"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute top-0 right-0 w-64 h-64" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="white" opacity="0.2" />
        </svg>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Main heading */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={onCtaClick}
          className="my-3 px-4 py-3 rounded-lg bg-white hover:bg-gray-100 text-blue-700 font-bold transition-ease duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Book a car wash now"
        >
          Book Now
        </button>

        {/* Secondary info */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 text-sm sm:text-base text-blue-100">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Instant booking confirmation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>No wait times</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Earn loyalty points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

HeroBanner.displayName = "HeroBanner";
