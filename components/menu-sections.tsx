"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

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

const normalizeForSearch = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

export default function MenuSections({ sections }: MenuSectionsProps) {
    const [activeSection, setActiveSection] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const normalizedKeyword = useMemo(() => normalizeForSearch(searchKeyword), [searchKeyword]);

    const filteredSections = useMemo(() => {
        if (!normalizedKeyword) {
            return sections;
        }

        return sections
            .map((section) => {
                const normalizedSectionTitle = normalizeForSearch(section.title);

                if (normalizedSectionTitle.includes(normalizedKeyword)) {
                    return section;
                }

                const filteredItems = section.items.filter((item) =>
                    normalizeForSearch(item.name).includes(normalizedKeyword)
                );

                return {
                    ...section,
                    items: filteredItems,
                };
            })
            .filter((section) => section.items.length > 0);
    }, [normalizedKeyword, sections]);

    const sectionIds = useMemo(
        () => filteredSections.map((section) => `${slugify(section.title)}-section`),
        [filteredSections]
    );

    const currentActiveSection = activeSection || sectionIds[0] || "";

    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isSearchOpen]);

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

    if (filteredSections.length === 0) {
        return (
            <div>
                <section className="sticky top-18 z-30 mt-4 bg-white pb-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Tìm sản phẩm"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full 
                            border border-slate-200 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                            onClick={() => {
                                setIsSearchOpen((prev) => {
                                    if (prev) {
                                        setSearchKeyword("");
                                    }

                                    return !prev;
                                });
                            }}
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${isSearchOpen
                                ? "max-w-sm flex-1 opacity-100"
                                : "max-w-0 opacity-0"
                                }`}
                        >
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchKeyword}
                                placeholder="Tìm pizza, combo, đồ uống..."
                                onChange={(event) => setSearchKeyword(event.target.value)}
                                className={`h-10 w-full rounded-full border border-slate-200 px-4 text-sm outline-none transition-all duration-300 ${isSearchOpen
                                    ? "translate-x-0"
                                    : "translate-x-2"
                                    }`}
                                tabIndex={isSearchOpen ? 0 : -1}
                            />
                        </div>
                    </div>
                </section>
                <p className="mt-6 text-sm text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</p>
            </div>
        );
    }

    return (
        <div>
            <section className="sticky top-18 z-30 mt-4 bg-white pb-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Tìm sản phẩm"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => {
                            setIsSearchOpen((prev) => {
                                if (prev) {
                                    setSearchKeyword("");
                                }

                                return !prev;
                            });
                        }}
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${isSearchOpen
                            ? "max-w-xs flex-1 opacity-100"
                            : "max-w-0 opacity-0"
                            }`}
                    >
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchKeyword}
                            placeholder="Tìm pizza, combo, đồ uống..."
                            onChange={(event) => setSearchKeyword(event.target.value)}
                            className={`h-10 w-full rounded-full border border-slate-200 px-4 text-sm outline-none transition-all duration-300 ${isSearchOpen
                                ? "translate-x-0"
                                : "translate-x-2"
                                }`}
                            tabIndex={isSearchOpen ? 0 : -1}
                        />
                    </div>

                    <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto">
                        {filteredSections.map((section, index) => {
                            const sectionId = sectionIds[index];
                            const isActive = currentActiveSection === sectionId;

                            return (
                                <a
                                    key={section.title}
                                    href={`#${sectionId}`}
                                    className={`uppercase whitespace-nowrap border-b-2 px-6 py-2 text-lg font-medium ${isActive
                                        ? "border-yellow-500 text-yellow-500"
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
                </div>
            </section>

            <section className="mt-16 space-y-8">
                {filteredSections.map((section, index) => (
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
