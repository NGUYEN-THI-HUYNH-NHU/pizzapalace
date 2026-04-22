"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Ward = {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  district_code: number;
};
type District = {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: Ward[];
};
type Province = {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code?: number;
  districts: District[];
};

type AddressModalProps = {
  open?: boolean;
  onClose?: () => void;
};

type Suggestion = {
  label: string;
  provinceCode: number;
  districtCode?: number;
};

const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
});

export default function AddressModal({
  open = false,
  onClose,
}: AddressModalProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [mode, setMode] = useState<"delivery" | "takeaway">("delivery");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let mounted = true;
    // fetch provinces + districts + wards (depth=3)
    void fetch("https://provinces.open-api.vn/api/v1/?depth=3")
      .then((r) => r.json())
      .then((data: Province[]) => {
        if (!mounted) return;
        setProvinces(data || []);
        if (data && data.length > 0) {
          setCity(String(data[0].code));
          const firstDistrict = data[0].districts && data[0].districts[0];
          if (firstDistrict) setDistrict(String(firstDistrict.code));
        }
      })
      .catch(() => {
        // ignore, keep provinces empty
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const p = provinces.find((p) => String(p.code) === city);
    if (p && p.districts && p.districts.length > 0) {
      setDistrict(String(p.districts[0].code));
    }
  }, [city, provinces]);

  // build suggestions when user types in address input
  useEffect(() => {
    const q = address.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const list: Suggestion[] = [];
    for (const prov of provinces) {
      if (prov.name.toLowerCase().includes(q)) {
        list.push({ label: prov.name, provinceCode: prov.code });
      }
      for (const dist of prov.districts || []) {
        if (dist.name.toLowerCase().includes(q)) {
          list.push({
            label: `${dist.name}, ${prov.name}`,
            provinceCode: prov.code,
            districtCode: dist.code,
          });
        }
        for (const ward of dist.wards || []) {
          if (ward.name.toLowerCase().includes(q)) {
            list.push({
              label: `${ward.name}, ${dist.name}, ${prov.name}`,
              provinceCode: prov.code,
              districtCode: dist.code,
            });
          }
        }
      }
    }

    setSuggestions(list.slice(0, 8));
    setShowSuggestions(list.length > 0);
  }, [address, provinces]);

  const handleMapPick = async (nextLat: number, nextLng: number) => {
    setLat(nextLat);
    setLng(nextLng);
    setShowSuggestions(false);
    setLocationError("");
    setResolvingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextLat}&lon=${nextLng}`
      );
      if (!response.ok) return;
      const data = (await response.json()) as { display_name?: string };
      if (data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${nextLat.toFixed(6)}, ${nextLng.toFixed(6)}`);
      }
    } catch {
      setAddress(`${nextLat.toFixed(6)}, ${nextLng.toFixed(6)}`);
    } finally {
      setResolvingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Trình duyệt không hỗ trợ định vị vị trí hiện tại.");
      return;
    }

    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void handleMapPick(
          position.coords.latitude,
          position.coords.longitude
        );
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError(
          "Không thể lấy vị trí hiện tại. Vui lòng cấp quyền vị trí rồi thử lại."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const isValid = useMemo(() => {
    if (mode === "delivery")
      return (
        address.trim().length >= 5 ||
        Boolean(city && district) ||
        Boolean(lat !== null && lng !== null)
      );
    return true; // takeaway only needs city/district
  }, [mode, address, city, district, lat, lng]);

  const handleApply = () => {
    const selectedProvince = provinces.find((p) => String(p.code) === city);
    const selectedDistrict = selectedProvince?.districts.find(
      (d) => String(d.code) === district
    );
    const payload = {
      mode,
      address: address.trim(),
      city: city ? { code: Number(city), name: selectedProvince?.name } : null,
      district: district
        ? { code: Number(district), name: selectedDistrict?.name }
        : null,
      coordinates:
        lat !== null && lng !== null
          ? { lat, lng }
          : null,
    };
    try {
      localStorage.setItem("pp_address", JSON.stringify(payload));
      // notify other components
      window.dispatchEvent(
        new CustomEvent("pp_address_changed", { detail: payload })
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore
    }
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 p-3"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-white shadow-xl">
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Đóng"
          className="absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex max-h-[calc(100vh-24px)] flex-col gap-3 overflow-hidden p-4 md:p-6">
          <h2 className="pr-8 text-center text-2xl font-bold text-foreground">
            TÌM CỬA HÀNG GẦN BẠN NHẤT
          </h2>
          <p className="text-center text-sm text-muted-foreground">
            Nhập địa chỉ của bạn để xem các ưu đãi, phiếu giảm giá và khuyến mại
            tại địa phương.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <Label className="cursor-pointer text-base font-medium text-foreground">
              <input
                type="radio"
                name="mode"
                checked={mode === "delivery"}
                onChange={() => setMode("delivery")}
              />
              <span>Giao hàng tới</span>
            </Label>
            <Label className="cursor-pointer text-base font-medium text-foreground">
              <input
                type="radio"
                name="mode"
                checked={mode === "takeaway"}
                onChange={() => setMode("takeaway")}
              />
              <span>Mua mang về</span>
            </Label>
          </div>

          <div className="relative z-50">
            <Input
              placeholder={
                mode === "delivery"
                  ? "Vui lòng nhập ít nhất 5 ký tự"
                  : "Vui lòng nhập địa chỉ hoặc chọn tỉnh/quận"
              }
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 border-border bg-background"
              aria-label="Địa chỉ"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute right-0 left-0 top-[calc(100%+6px)] z-1000 max-h-52 overflow-auto rounded-md border border-border bg-white shadow-md">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setAddress(s.label);
                      setCity(String(s.provinceCode));
                      if (s.districtCode) setDistrict(String(s.districtCode));
                      setShowSuggestions(false);
                    }}
                    className="cursor-pointer border-b border-border px-3 py-2 text-sm last:border-b-0 hover:bg-muted"
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {resolvingAddress
                ? "Đang cập nhật địa chỉ từ vị trí đã chọn..."
                : lat !== null && lng !== null
                  ? `Đã chọn vị trí: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
                  : "Nhấn vào bản đồ để chọn vị trí giao hàng"}
            </p>
          </div>

          <div className="relative z-0 overflow-hidden rounded-xl border border-border">
            <MapPicker lat={lat} lng={lng} onPick={handleMapPick} height={190} />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="h-10"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 text-red-600" />
              )}
              <span>
                {locating
                  ? "Đang lấy vị trí hiện tại..."
                  : "Sử dụng vị trí hiện tại"}
              </span>
            </Button>
            {locationError && (
              <p className="text-xs text-destructive">{locationError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="button" variant="secondary" size="lg" onClick={() => onClose?.()}>
              Huỷ
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleApply}
              disabled={!isValid}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
