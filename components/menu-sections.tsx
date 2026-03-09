"use client";

import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/components/product-card";
import { Product } from "@/type";

type MenuSection = {
    title: string;
    items: Product[];
};

type MenuSectionsProps = {
    sections: MenuSection[];
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

export default function MenuSections({ sections }: MenuSectionsProps) {
    const [activeSection, setActiveSection] = useState("");

    const sectionIds = useMemo(
        () => sections.map((section) => `${slugify(section.title)}-section`),
        [sections]
    );

    const currentActiveSection = activeSection || sectionIds[0] || "";

    useEffect(() => {
        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter((element): element is HTMLElement => Boolean(element));

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visibleEntries[0]?.target.id) {
                    setActiveSection(visibleEntries[0].target.id);
                }
            },
            {
                rootMargin: "-140px 0px -55% 0px",
                threshold: [0.2, 0.4, 0.6],
            }
        );

        elements.forEach((element) => observer.observe(element));

        return () => {
            elements.forEach((element) => observer.unobserve(element));
            observer.disconnect();
        };
    }, [sectionIds]);

    if (sections.length === 0) {
        return <p className="text-sm text-muted-foreground">Chưa tải được sản phẩm từ API.</p>;
    }

    return (
        <>
            <section className="sticky top-18 z-30 mt-4 border-b border-b-gray-200 bg-white pb-3">
                <div className="flex gap-3 overflow-x-auto">
                    {sections.map((section, index) => {
                        const sectionId = sectionIds[index];
                        const isActive = currentActiveSection === sectionId;

                        return (
                            <a
                                key={section.title}
                                href={`#${sectionId}`}
                                className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium ${isActive
                                    ? "border-red-600 text-red-600"
                                    : "border-transparent text-muted-foreground"
                                    }`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    const target = document.getElementById(sectionId);
                                    if (target) {
                                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                                        setActiveSection(sectionId);
                                    }
                                }}
                            >
                                {section.title}
                            </a>
                        );
                    })}
                </div>
            </section>

            <section className="mt-6 space-y-8">
                {sections.map((section, index) => (
                    <div key={section.title} id={sectionIds[index]} className="scroll-mt-36">
                        <h2 className="mb-4 text-2xl font-bold uppercase">{section.title}</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {section.items.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </>
    );
}
