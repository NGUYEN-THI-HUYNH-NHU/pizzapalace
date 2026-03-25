"use client";

import React, { useEffect, useMemo, useState } from "react";

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

export default function AddressModal({
  open = false,
  onClose,
}: AddressModalProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [mode, setMode] = useState<"delivery" | "takeaway">("delivery");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  // Google Maps picker removed — keep simple address + province/district selects
  type Suggestion = {
    label: string;
    provinceCode: number;
    districtCode?: number;
  };
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDistrict(String(p.districts[0].code));
    }
  }, [city, provinces]);

  // build suggestions when user types in address input
  useEffect(() => {
    const q = address.trim().toLowerCase();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // map-related effect removed

  const isValid = useMemo(() => {
    if (mode === "delivery")
      return address.trim().length >= 5 || Boolean(city && district);
    return true; // takeaway only needs city/district
  }, [mode, address, city, district]);

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
      // lat/lng removed
    };
    try {
      localStorage.setItem("pp_address", JSON.stringify(payload));
      // notify other components
      window.dispatchEvent(
        new CustomEvent("pp_address_changed", { detail: payload })
      );
    } catch (e) {
      // ignore
    }
    onClose?.();
  };

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h2 style={titleStyle}>TÌM CỬA HÀNG GẦN BẠN NHẤT</h2>
        <p style={descStyle}>
          Nhập địa chỉ của bạn để xem các ưu đãi, phiếu giảm giá và khuyến mại
          tại địa phương.
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="mode"
              checked={mode === "delivery"}
              onChange={() => setMode("delivery")}
            />
            <span style={{ marginLeft: 8 }}>Giao hàng tới</span>
          </label>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="mode"
              checked={mode === "takeaway"}
              onChange={() => setMode("takeaway")}
            />
            <span style={{ marginLeft: 8 }}>Mua mang về</span>
          </label>
        </div>

        <div style={{ marginTop: 12, position: "relative" }}>
          <input
            placeholder={
              mode === "delivery"
                ? "Vui lòng nhập ít nhất 5 ký tự"
                : "Vui lòng nhập địa chỉ hoặc chọn tỉnh/ quận"
            }
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
            // allow typing for both delivery and takeaway
            disabled={false}
            aria-label="Địa chỉ"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "calc(100% + 6px)",
                background: "#fff",
                border: "1px solid #e6e6e6",
                borderRadius: 6,
                maxHeight: 200,
                overflow: "auto",
                zIndex: 10000,
                padding: 0,
                margin: 0,
                listStyle: "none",
              }}
            >
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setAddress(s.label);
                    setCity(String(s.provinceCode));
                    if (s.districtCode) setDistrict(String(s.districtCode));
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f3f3f3",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ color: "#6b7280" }}>📍</span>
                    <div>
                      <div style={{ fontSize: 13 }}>{s.label}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div
            style={{
              color: "#e53935",
              marginTop: 8,
              cursor: "default",
            }}
          >
            📍 Chọn vị trí trên bản đồ (bị tắt - không có API key)
          </div>
        </div>

        {/* Map UI removed */}

        <div
          style={{
            textAlign: "center",
            margin: "12px 0",
            color: "#666",
          }}
        >
          hoặc
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={selectStyle}
          >
            {provinces.map((p) => (
              <option key={p.code} value={String(p.code)}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={selectStyle}
          >
            {(
              provinces.find((p) => String(p.code) === city)?.districts ?? []
            ).map((d) => (
              <option key={d.code} value={String(d.code)}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button onClick={() => onClose?.()} style={secondaryBtnStyle}>
            Huỷ
          </button>
          <button
            onClick={handleApply}
            disabled={!isValid}
            style={{ ...primaryBtnStyle, opacity: isValid ? 1 : 0.6 }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

// --- styles (inline to avoid touching global css) ---
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  width: 640,
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
};
const descStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: 13,
  color: "#666",
  marginTop: 8,
};
const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #e6e6e6",
  marginTop: 8,
};
const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #e6e6e6",
};
const primaryBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#f0b100",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
};
const secondaryBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#f3f4f6",
  color: "#111827",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
};
