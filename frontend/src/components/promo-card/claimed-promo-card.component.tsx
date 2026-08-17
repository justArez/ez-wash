import React from "react";
import type { ClaimedPromo } from "@/models/promo.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Sparkles } from "lucide-react";

interface ClaimedPromoCardProps {
  voucher: ClaimedPromo;
  onUseNow: (voucher: ClaimedPromo) => void;
}

export const ClaimedPromoCard: React.FC<ClaimedPromoCardProps> = ({
  voucher,
  onUseNow,
}) => {
  const isExpired = voucher.status === "EXPIRED";

  if (isExpired) {
    return (
      <Card className="flex flex-col justify-between overflow-hidden border border-[#fecaca] bg-gradient-to-br from-[#ffffff] via-[#fff8f8] to-[#fef2f2] rounded-[18px] shadow-[0_6px_20px_rgba(239,68,68,0.04)]">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-bold text-[#991b1b] line-clamp-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#dc2626] shrink-0" />
              {voucher.title}
            </CardTitle>
            <Badge className="bg-[#fee2e2] text-[#dc2626] border-[#fca5a5] text-[10px] font-bold tracking-wide uppercase">
              EXPIRED
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 flex flex-col gap-3 flex-1 justify-between">
          <p className="text-xs text-[#7f1d1d]/80 line-clamp-2 leading-relaxed">
            {voucher.description ||
              "This promotional reward voucher has expired."}
          </p>

          <div className="pt-2 border-t border-[#fee2e2] flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-[#991b1b] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#f87171]" />
              Expired on:{" "}
              <strong className="text-[#dc2626]">{voucher.validUntil}</strong>
            </span>

            <Button
              type="button"
              disabled
              className="text-xs font-bold py-1.5 px-3 bg-[#fee2e2] hover:bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] cursor-not-allowed shadow-none"
            >
              EXPIRED
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-[#d7d3eb] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f8f7ff] rounded-[18px] shadow-[0_10px_25px_rgba(44,38,79,0.05)] hover:shadow-[0_15px_30px_rgba(44,38,79,0.09)] hover:border-[#3a46ed] transition-all duration-200">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold text-[#2c264f] line-clamp-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0" />
            {voucher.title}
          </CardTitle>
          <Badge className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0] text-[10px] font-bold tracking-wide">
            READY TO USE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 flex flex-col gap-3 flex-1 justify-between">
        <p className="text-xs text-[#676375] line-clamp-2 leading-relaxed">
          {voucher.description ||
            "Active claimed promo discount ready for your next booking."}
        </p>

        <div className="pt-2 border-t border-[#e8e6f3] flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-[#676375] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#a7a2c4]" />
            Valid till:{" "}
            <strong className="text-[#3d3a4f]">{voucher.validUntil}</strong>
          </span>

          <Button
            type="button"
            onClick={() => onUseNow(voucher)}
            className="text-xs font-bold py-1.5 px-3 bg-[#3a46ed] hover:bg-[#3721b6] text-white shadow-xs active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
            USE NOW
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
