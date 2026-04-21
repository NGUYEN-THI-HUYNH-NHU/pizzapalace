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
    const animationFrameRef = useRef<number | null>(null);
    const isNavLockedRef = useRef(false);
    const lockedSectionIdRef = useRef("");

    const stickyOffset = 170;

    const updateHashWithoutPush = (sectionId: string) => {
        if (typeof window === "undefined") {
            return;
        }

        const nextHash = `#${sectionId}`;
        if (window.location.hash === nextHash) {
            return;
        }

        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
    };

    const scrollToSection = (sectionId: string, behavior: ScrollBehavior = "auto") => {
        const target = document.getElementById(sectionId);
        if (!target) {
            return;
        }

        const targetTop = target.getBoundingClientRect().top + window.scrollY - stickyOffset;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior });
    };

    const stopFastScrollAnimation = () => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        isNavLockedRef.current = false;
    };

    const fastScrollToSection = (sectionId: string) => {
        const target = document.getElementById(sectionId);
        if (!target) {
            return;
        }

        stopFastScrollAnimation();

        const startY = window.scrollY;
        const endY = Math.max(target.getBoundingClientRect().top + window.scrollY - stickyOffset, 0);
        const distance = endY - startY;
        const distanceAbs = Math.abs(distance);

        if (distanceAbs < 2) {
            return;
        }

        // Car-like timing
        const duration = Math.min(1100, Math.max(260, 220 + Math.sqrt(distanceAbs) * 20));
        let startedAt: number | null = null;
        isNavLockedRef.current = true;
        lockedSectionIdRef.current = sectionId;

        const step = (timestamp: number) => {
            if (startedAt === null) {
                startedAt = timestamp;
            }

            const elapsed = timestamp - startedAt;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-in-out quintic for a clear accelerate -> decelerate motion profile.
            const easedProgress = progress < 0.5
                ? 16 * Math.pow(progress, 5)
                : 1 - Math.pow(-2 * progress + 2, 5) / 2;
            const nextY = startY + distance * easedProgress;

            window.scrollTo({ top: nextY, behavior: "auto" });

            if (progress < 1) {
                animationFrameRef.current = window.requestAnimationFrame(step);
                return;
            }

            animationFrameRef.current = null;
            isNavLockedRef.current = false;
            window.scrollTo({ top: endY, behavior: "auto" });
        };

        animationFrameRef.current = window.requestAnimationFrame(step);
    };

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
        () => filteredSections.map((section) => `${slugify(section.title)}`),
        [filteredSections]
    );

    const currentActiveSection = activeSection || sectionIds[0] || "";

    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        return () => {
            stopFastScrollAnimation();
        };
    }, []);

    useEffect(() => {
        if (!activeSection) {
            return;
        }

        updateHashWithoutPush(activeSection);
    }, [activeSection]);

    useEffect(() => {
        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter((element): element is HTMLElement => Boolean(element));

        if (elements.length === 0) {
            return;
        }

        const updateActiveSection = () => {
            if (isNavLockedRef.current && lockedSectionIdRef.current) {
                const lockedSectionId = lockedSectionIdRef.current;
                setActiveSection((current) => (current === lockedSectionId ? current : lockedSectionId));
                return;
            }

            lockedSectionIdRef.current = "";

            let nextActiveId = elements[0].id;

            for (const element of elements) {
                const top = element.getBoundingClientRect().top;

                if (top - stickyOffset <= 0) {
                    nextActiveId = element.id;
                } else {
                    break;
                }
            }

            setActiveSection((current) => {
                if (current === nextActiveId) {
                    return current;
                }
                return nextActiveId;
            });
        };

        updateActiveSection();

        window.addEventListener("scroll", updateActiveSection, { passive: true });
        window.addEventListener("resize", updateActiveSection);

        return () => {
            window.removeEventListener("scroll", updateActiveSection);
            window.removeEventListener("resize", updateActiveSection);
        };
    }, [sectionIds]);

    useEffect(() => {
        if (sectionIds.length === 0 || typeof window === "undefined") {
            return;
        }

        const hashedId = decodeURIComponent(window.location.hash.replace("#", ""));
        if (!hashedId || !sectionIds.includes(hashedId)) {
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            setActiveSection(hashedId);
            scrollToSection(hashedId);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [sectionIds]);

    if (sections.length === 0) {
        return <p className="text-sm text-muted-foreground">Chưa tải được sản phẩm từ API.</p>;
    }

    if (filteredSections.length === 0) {
        return (
            <div>
                <section className="sticky top-18 z-30 bg-white py-3 border-t border-b">
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
            <section className="sticky top-18 z-30 bg-white py-3 border-t border-b">
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
                                        ? "border-yellow-500 border-b-2 rounded-full text-yellow-500"
                                        : "border-transparent text-muted-foreground"
                                        }`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setActiveSection(sectionId);
                                        lockedSectionIdRef.current = sectionId;
                                        updateHashWithoutPush(sectionId);
                                        fastScrollToSection(sectionId);
                                    }}
                                >
                                    {section.title}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section>
                {filteredSections.map((section, index) => (
                    <div key={section.title} id={sectionIds[index]} className="scroll-mt-36">
                        <div className="mt-8 mb-4 flex items-center gap-4">
                            <span className="h-px flex-1 bg-slate-200" />
                            <h2 className="shrink-0 text-center text-2xl font-bold uppercase">{section.title}</h2>
                            <span className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="grid gap-5 lg:grid-cols-2">
                            {section.items.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>
                ))
                }
            </section >
        </div >
    );
}
