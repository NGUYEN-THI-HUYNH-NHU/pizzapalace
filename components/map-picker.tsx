"use client";

import { useEffect, useMemo } from "react";
import { DivIcon } from "leaflet";
import {
    Marker,
    MapContainer,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";

type MapPickerProps = {
    lat: number | null;
    lng: number | null;
    onPick: (lat: number, lng: number) => void;
    height?: number;
};

const DEFAULT_CENTER: [number, number] = [16.0544, 108.2022];

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
    }, [center, map]);

    return null;
}

function FixMapInModal() {
    const map = useMap();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            map.invalidateSize();
        }, 120);

        const handleResize = () => map.invalidateSize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", handleResize);
        };
    }, [map]);

    return null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (event) => {
            onPick(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

export default function MapPicker({ lat, lng, onPick, height = 220 }: MapPickerProps) {
    const center = useMemo<[number, number]>(
        () => (lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER),
        [lat, lng]
    );

    const pinIcon = useMemo(
        () =>
            new DivIcon({
                className: "",
                html: "<span style='display:block;width:16px;height:16px;border-radius:9999px;background:#ef4444;border:2px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);'></span>",
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            }),
        []
    );

    return (
        <MapContainer
            center={center}
            zoom={lat !== null && lng !== null ? 16 : 6}
            scrollWheelZoom
            preferCanvas
            style={{ width: "100%", height, borderRadius: 10 }}
        >
            <FixMapInModal />
            <RecenterMap center={center} />
            <ClickHandler onPick={onPick} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {lat !== null && lng !== null && (
                <Marker position={[lat, lng]} icon={pinIcon} />
            )}
        </MapContainer>
    );
}
