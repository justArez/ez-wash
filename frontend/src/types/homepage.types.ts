/**
 * Homepage UI Enhancement with shadcn - Type Definitions
 * Defines all entities, interfaces, and types for the homepage feature
 * Feature: 004-homepage-shadcn-redesign
 */

/**
 * Promotion - Represents a promotional offer displayed in the carousel
 */
export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountPercentage: number; // 0-100
  loyaltyPointsRequired: number;
  loyaltyPointsValue: number;
  expiryDate: string; // ISO 8601
  category: "discount" | "points_bonus" | "new_member";
  terms: string;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * TimeSlot - Represents an available or booked car wash time slot
 */
export interface TimeSlot {
  id: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  time: string; // 24-hour format HH:MM
  displayTime: string; // Formatted time for UI (HH:MM AM/PM)
  duration: number; // minutes
  status: "available" | "booked" | "maintenance";
  capacity: number;
  currentBookings: number;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  dayDisplayDate: string; // '19/10', '20/10', etc.
}

/**
 * TimeSlotWithComputedFields - TimeSlot with derived UI values
 */
export interface TimeSlotWithComputedFields extends TimeSlot {
  isAvailable: boolean; // Computed: status === 'available' && currentBookings < capacity
  isPast: boolean; // Computed: the slot's local date/time has already passed
  slotLabel: string; // Computed: "${dayOfWeek} (${dayDisplayDate})"
  timeLabel: string; // Computed: displayTime
}

/**
 * NavigationItem - Represents a navigation link in the header
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  visibleFor: "all" | "guest" | "logged_in";
  icon?: React.ReactNode;
  requiresAuth: boolean;
}

/**
 * HeroBanner - Represents the hero banner section
 */
export interface HeroBanner {
  heading: string;
  subheading: string;
  backgroundImage?: string;
  ctaLabel: string;
  ctaAction: () => void;
  theme: "light" | "dark";
}

/**
 * FooterLink - Represents a footer link
 */
export interface FooterLink {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
}

/**
 * API Response wrapper types
 */
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  errorCode?: string;
  timestamp: string;
}

/**
 * API Response for promotions list
 */
export interface PromotionsResponse extends ApiResponse<Promotion[]> {
  count: number;
  data: Promotion[];
}

/**
 * API Response for time slots list
 */
export interface TimeSlotsResponse extends ApiResponse<TimeSlot[]> {
  count: number;
  data: TimeSlot[];
}

/**
 * Hook return types
 */
export interface UsePromotionsReturn {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseSlotsReturn {
  slots: TimeSlot[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastRefreshTime: number | null;
  nextRefreshCountdown: number; // Seconds until next auto-refresh
}

export interface UseCarouselTimerReturn {
  currentIndex: number;
  isAutoPlaying: boolean;
  countdown: number; // Seconds until next auto-advance
  advance: () => void;
  previous: () => void;
  goToSlide: (index: number) => void;
  resetCountdown: () => void;
  stop: () => void;
  resume: () => void;
}

/**
 * Component Props types
 */
export interface SlotCardProps {
  slot: TimeSlotWithComputedFields;
  onClick: (slot: TimeSlot) => void;
  isSelected?: boolean;
  showTime?: boolean;
}

export interface SlotCalendarProps {
  selectedSlotId?: string;
  onSlotClick: (slot: TimeSlot) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
}

export interface SlotRefreshButtonProps {
  onRefresh: () => Promise<void>;
  nextRefreshCountdown: number;
  isRefreshing?: boolean;
}

export interface PromotionCardProps {
  promotion: Promotion;
  onViewDetails: (promotion: Promotion) => void;
  isLoading?: boolean;
}

export interface PromotionCarouselProps {
  onPromotionSelected?: (promotion: Promotion) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export interface PromotionDetailsModalProps {
  promotion: Promotion | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface HeroBannerProps {
  onCtaClick: () => void;
  title?: string;
  subtitle?: string;
}

export interface HeaderProps {
  currentPage?: string;
  onNavigate?: (path: string) => void;
}

export interface FooterProps {
  links?: FooterLink[];
}
