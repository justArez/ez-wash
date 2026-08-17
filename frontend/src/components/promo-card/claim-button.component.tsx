import React from "react";
import type { PromoButtonState } from "@/models/promo.model";
import { Button } from "@/components/ui/button";

interface ClaimButtonProps {
  buttonState: PromoButtonState;
  onClick: () => void;
  isSubmitting?: boolean;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({
  buttonState,
  onClick,
  isSubmitting = false,
}) => {
  switch (buttonState.type) {
    case "UNAUTHENTICATED":
      return (
        <Button
          type="button"
          variant="outline"
          className="w-full text-xs font-bold py-2 px-3 border-[#d7d3eb] text-[#3a46ed] hover:bg-[#f1efff] hover:text-[#3721b6] rounded-xl"
          onClick={onClick}
        >
          Sign In to Claim
        </Button>
      );

    case "LACKS_TIER":
      return (
        <Button
          type="button"
          disabled
          className="w-full text-xs font-bold py-1.5 px-3 bg-[#f1f5f9] hover:bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] cursor-not-allowed uppercase rounded-xl shadow-none"
        >
          Insufficient Tier
        </Button>
      );

    case "INSUFFICIENT_PTS":
      return (
        <Button
          type="button"
          disabled
          className="w-full text-xs font-bold py-1.5 px-3 bg-[#f1f5f9] hover:bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] cursor-not-allowed uppercase rounded-xl shadow-none"
        >
          Insufficient Points
        </Button>
      );

    case "CLAIMABLE":
      return (
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onClick}
          className="group relative w-full overflow-hidden text-xs font-bold py-2 px-3 h-8 shadow-sm bg-[#3a46ed] hover:bg-[#3721b6] text-white cursor-pointer active:scale-[0.98] rounded-xl transition-colors duration-200"
        >
          {isSubmitting ? (
            <span>Claiming...</span>
          ) : (
            <>
              {/* Default Points label: moves up & fades out on hover, smoothly moves back down on unhover */}
              <span className="flex items-center justify-center gap-1 font-medium tracking-wide transition-all duration-200 ease-out transform group-hover:-translate-y-6 group-hover:opacity-0">
                {buttonState.pointPrice} points
              </span>

              {/* Hover Claim label: moves into center on hover, moves back down on unhover */}
              <span className="absolute inset-0 flex items-center justify-center gap-1 font-extrabold tracking-wide transition-all duration-200 ease-out transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                Claim Now
              </span>
            </>
          )}
        </Button>
      );
  }
};
