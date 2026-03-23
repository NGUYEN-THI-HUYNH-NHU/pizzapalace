"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { KeySquareIcon, LogOut } from "lucide-react";

const ProfilePage = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const profileFormRef = useRef<HTMLFormElement>(null);
    const { user, isLoading, isHydrating, errorMessage, clearError, hydrateProfile, updateProfile } = useProfile();
    const { logout } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            const isAuthenticated = await hydrateProfile();

            if (!isAuthenticated) {
                router.replace("/auth/sign-in");
            }
        };

        void loadProfile();
    }, [hydrateProfile, router]);

    const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const address = String(formData.get("address") || "").trim();

        const isUpdated = await updateProfile({ name, phone, address });

        if (isUpdated) {
            setIsEditing(false);
            toast.success("Đã cập nhật thông tin hồ sơ.");
        }
    };

    const handlePrimaryAction = () => {
        if (!isEditing) {
            clearError();
            setIsEditing(true);
            return;
        }

        profileFormRef.current?.requestSubmit();
    };

    const handleLogout = () => {
        void logout();
    };

    if (isHydrating || !user) {
        return <div className="px-4 py-10 text-sm text-slate-500">Đang tải thông tin...</div>;
    }

    return (
        <div className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 p-4">
                <div className="col-span-1 rounded-2xl border shadow h-fit py-2 mb-6">
                    <Link
                        href="/profile/change-password"
                        className="flex items-center gap-2 w-full p-3 transition hover:bg-gray-50"
                    >
                        <KeySquareIcon className="h-4 w-4" />
                        Đổi mật khẩu
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full p-3 transition hover:bg-gray-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </button>
                </div>

                <form
                    ref={profileFormRef}
                    className="md:col-start-2 md:col-end-4 max-h-fit rounded-2xl border bg-white shadow-xl p-4 space-y-5"
                    onSubmit={handleUpdateProfile}
                >
                    <h1 className="text-3xl font-bold text-yellow-500 flex justify-center">Hồ sơ của tôi</h1>
                    <p className="mt-2 text-sm text-slate-600">Quản lý thông tin tài khoản và bảo mật đăng nhập.</p>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Họ tên</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user.name ?? ""}
                                    placeholder="Nhập họ tên"
                                    disabled={!isEditing}
                                    className="h-11 rounded-xl border-yellow-200 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    required
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={user.phone ?? ""}
                                    placeholder="Nhập số điện thoại"
                                    pattern="(0|\+84)[0-9]{9,10}"
                                    disabled={!isEditing}
                                    className="h-11 rounded-xl border-yellow-200 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    required
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="address">Địa chỉ giao hàng</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={user.address ?? ""}
                                    placeholder="Nhập địa chỉ giao hàng"
                                    disabled={!isEditing}
                                    className="h-11 rounded-xl border-yellow-200 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <FieldError>{errorMessage}</FieldError>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handlePrimaryAction}
                            disabled={isLoading}
                            className="mt-4 h-11 w-full rounded-xl bg-yellow-500 text-sm font-semibold text-white transition hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isEditing ? (isLoading ? "Đang cập nhật..." : "Lưu thay đổi") : "Chỉnh sửa"}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default ProfilePage;