import type { MouseEventHandler } from "react";

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  onNavigate: (target: string) => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onOpenBookings: () => void;
}

export default function Header({
  isLoggedIn,
  username,
  onNavigate,
  onOpenSignIn,
  onOpenSignUp,
  onOpenBookings,
}: HeaderProps) {
  return (
    <div className="navbar card">
      <div className="navbar-group navbar-left">
        <button
          className="navbar-item"
          type="button"
          onClick={() => onNavigate("home")}
        >
          Home
        </button>
        {isLoggedIn && (
          <button
            className="navbar-item"
            type="button"
            onClick={onOpenBookings}
          >
            Bookings
          </button>
        )}
        <button
          className="navbar-item"
          type="button"
          onClick={() => onNavigate("promo")}
        >
          Promo
        </button>
      </div>

      <div className="navbar-group navbar-right">
        {isLoggedIn ? (
          <button
            className="navbar-item avatar-button"
            type="button"
            onClick={() => onNavigate("home")}
          >
            <span className="avatar">
              {username?.charAt(0).toUpperCase() ?? "U"}
            </span>
            <span>{username ?? "Member"}</span>
          </button>
        ) : (
          <>
            <span className="guest-label">Browsing as Guest</span>
            <button
              className="navbar-item"
              type="button"
              onClick={onOpenSignIn}
            >
              Sign In
            </button>
            <button
              className="navbar-item navbar-cta"
              type="button"
              onClick={onOpenSignUp}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
