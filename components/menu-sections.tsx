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

        const stickyOffset = 170;

        const updateActiveSection = () => {
            let nextActiveId = elements[0].id;

            for (const element of elements) {
                const top = element.getBoundingClientRect().top;

                if (top - stickyOffset <= 0) {
                    nextActiveId = element.id;
                } else {
                    break;
                }
            }

            setActiveSection((current) => (current === nextActiveId ? current : nextActiveId));
        };

        updateActiveSection();

        window.addEventListener("scroll", updateActiveSection, { passive: true });
        window.addEventListener("resize", updateActiveSection);

        return () => {
            window.removeEventListener("scroll", updateActiveSection);
            window.removeEventListener("resize", updateActiveSection);
        };
    }, [sectionIds]);

    if (sections.length === 0) {
        return <p className="text-sm text-muted-foreground">Chưa tải được sản phẩm từ API.</p>;
    }

    return (
        <div>
            <section className="sticky top-18 z-30 mt-4  bg-white pb-3">
                <div className="flex gap-3 overflow-x-auto">
                    {sections.map((section, index) => {
                        const sectionId = sectionIds[index];
                        const isActive = currentActiveSection === sectionId;

                        return (
                            <a
                                key={section.title}
                                href={`#${sectionId}`}
                                className={`uppercase whitespace-nowrap border-b-2 px-6 py-2 text-lg font-medium ${isActive
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

            <section className="mt-16 space-y-8">
                {sections.map((section, index) => (
                    <div key={section.title} id={sectionIds[index]} className="scroll-mt-36">
                        <h2 className="mb-4 text-2xl font-bold uppercase">{section.title}</h2>
                        <div className="grid gap-5 md:grid-cols-2">
                            {section.items.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div >
    );
}
