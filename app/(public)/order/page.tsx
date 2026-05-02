"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { Order, Product } from "@/type";
import { OrderStatus } from "@/type";

import { NewOrderCard } from "./components/new-order-card";
import { OldOrderCard } from "./components/old-order-card";

type OrderListResponse = {
  orders: Order[];
};

type SessionResponse = {
  id?: string;
};

type RealtimeOrderPayload = {
  order?: Order;
};

const ACTIVE_STATUSES = new Set([
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.DELIVERING,
]);

const upsertOrder = (current: Order[], incomingOrder: Order) => {
  const existingIndex = current.findIndex(
    (order) => order.id === incomingOrder.id,
  );
  if (existingIndex === -1) {
    return [incomingOrder, ...current];
  }

  const next = [...current];
  next[existingIndex] = incomingOrder;
  return next;
};

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasGuestResults, setHasGuestResults] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const catalog = await fetch("/api/product-catalog")
          .then((response) => response.json())
          .catch(() => []);

        setProducts(Array.isArray(catalog) ? catalog : []);
      } catch (error) {
        console.error("Không thể tải catalog sản phẩm:", error);
      }
    };

    const bootstrap = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (sessionResponse.ok) {
          const sessionPayload =
            (await sessionResponse.json()) as SessionResponse;

          if (sessionPayload?.id) {
            setIsAuthenticated(true);

            const ordersResponse = await fetch("/api/orders", {
              cache: "no-store",
            });
            if (!ordersResponse.ok) {
              throw new Error(
                `Failed to fetch orders: ${ordersResponse.status}`,
              );
            }

            const payload = (await ordersResponse.json()) as OrderListResponse;
            setOrders(Array.isArray(payload.orders) ? payload.orders : []);
            return;
          }
        }

        setIsAuthenticated(false);
        setOrders([]);
      } catch (error) {
        console.error("Loi bootstrap order page:", error);
        setSearchError("Không thể tải đơn hàng. Vui lòng thử lại.");
      } finally {
        setIsBootstrapping(false);
      }
    };

    fetchProducts();
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
    let socket: Socket | null = null;

    const initRealtime = async () => {
      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      if (!sessionResponse.ok) {
        return;
      }

      const sessionPayload = (await sessionResponse.json()) as SessionResponse;
      if (!sessionPayload?.id) {
        return;
      }

      socket = io(realtimeUrl, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        socket?.emit("join:user", { userId: sessionPayload.id });
      });

      socket.on("order:updated", (payload: RealtimeOrderPayload) => {
        const incomingOrder = payload?.order;
        if (!incomingOrder) {
          return;
        }

        setOrders((current) => upsertOrder(current, incomingOrder));
      });
    };

    initRealtime().catch((error) => {
      console.error("Lỗi khởi tạo order realtime.", error);
    });

    return () => {
      socket?.disconnect();
    };
  }, [isAuthenticated]);

  const productCatalog = useMemo(
    () =>
      Object.fromEntries(
        products.map((product) => [product.id, product]),
      ) as Record<string, Product | undefined>,
    [products],
  );

  const activeOrders = orders.filter((order) =>
    ACTIVE_STATUSES.has(order.status),
  );
  const historyOrders = orders.filter(
    (order) => !ACTIVE_STATUSES.has(order.status),
  );
  const guestMatchedOrders = orders;
  const hasOrders = orders.length > 0;

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const phone = searchPhone.trim();
    const orderId = searchOrderId.trim();

    if (!phone && !orderId) {
      setSearchError("Vui lòng nhập số điện thoại hoặc mã đơn hàng.");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setHasGuestResults(true);

    try {
      const query = new URLSearchParams();
      if (phone) {
        query.set("phone", phone);
      }
      if (orderId) {
        query.set("orderId", orderId);
      }

      const response = await fetch(`/api/orders?${query.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response
        .json()
        .catch(() => ({}))) as OrderListResponse & { message?: string };

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể tra cứu đơn hàng.");
      }

      const foundOrders = Array.isArray(payload.orders) ? payload.orders : [];
      setOrders(foundOrders);

      if (foundOrders.length === 0) {
        setSearchError(
          "Không tìm thấy đơn hàng phù hợp với thông tin đã nhập.",
        );
      }
    } catch (error) {
      console.error("Loi tra cuu don hang:", error);
      setOrders([]);
      setSearchError(
        error instanceof Error ? error.message : "Không thể tra cứu đơn hàng.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="w-full py-6">
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          Đang tải đơn hàng...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 py-6 px-3">
      {!isAuthenticated ? (
        <>
          <section className="flex justify-center">
            <div className="w-full lg:w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="text-slate-900 px-5 py-6 md:px-6">
                <h2 className="mt-2 text-2xl font-bold">
                  Tra cứu đơn hàng nhanh
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-700">
                  Nhập số điện thoại hoặc mã đơn hàng từ email xác nhận để xem
                  trạng thái đơn.
                </p>
              </div>

              <form className="space-y-4 p-5 md:p-6" onSubmit={handleSearch}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      placeholder="Ví dụ: 0912345678"
                      value={searchPhone}
                      onChange={(event) => setSearchPhone(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Mã đơn hàng
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 61e8e3dd7f041490d72h6dc1"
                      value={searchOrderId}
                      onChange={(event) => setSearchOrderId(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>
                </div>

                {searchError && (
                  <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {searchError}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearching ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchPhone("");
                      setSearchOrderId("");
                      setSearchError("");
                      setOrders([]);
                      setHasGuestResults(false);
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Xóa form
                  </button>
                </div>
              </form>
            </div>
          </section>

          {!hasGuestResults ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">
                Cần gì để tra cứu?
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>&bull; Số điện thoại đã nhập khi đặt hàng</li>
                <li>&bull; Hoặc mã đơn hàng trong email xác nhận</li>
                <li>&bull; Kết quả sẽ chỉ hiển thị đúng đơn bạn tra cứu</li>
              </ul>
            </section>
          ) : (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  Kết quả tra cứu
                </h2>
                <span className="text-sm text-slate-500">
                  {guestMatchedOrders.length} đơn
                </span>
              </div>

              {guestMatchedOrders.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Không tìm thấy đơn hàng phù hợp với thông tin đã nhập.
                </p>
              ) : (
                <div className="space-y-4">
                  {guestMatchedOrders.map((order) =>
                    ACTIVE_STATUSES.has(order.status) ? (
                      <NewOrderCard
                        key={order.id}
                        order={order}
                        productCatalog={productCatalog}
                        onOrderUpdated={(updatedOrder) => {
                          setOrders((current) =>
                            upsertOrder(current, updatedOrder),
                          );
                        }}
                      />
                    ) : (
                      <OldOrderCard
                        key={order.id}
                        order={order}
                        productCatalog={productCatalog}
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Đơn hàng đang thực hiện
              </h2>
              <span className="text-sm text-slate-500">
                {activeOrders.length} đơn
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Hiện tại bạn không có đơn nào đang xử lý.
              </p>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <NewOrderCard
                    key={order.id}
                    order={order}
                    productCatalog={productCatalog}
                    onOrderUpdated={(updatedOrder) => {
                      setOrders((current) =>
                        upsertOrder(current, updatedOrder),
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Lịch sử đặt hàng
              </h2>
              <span className="text-sm text-slate-500">
                {historyOrders.length} đơn
              </span>
            </div>

            {historyOrders.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Bạn chưa có lịch sử đặt hàng.
              </p>
            ) : (
              <div className="space-y-3">
                {historyOrders.map((order) => (
                  <OldOrderCard
                    key={order.id}
                    order={order}
                    productCatalog={productCatalog}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {isAuthenticated && !hasOrders ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            Chưa có đơn hàng nào trong tài khoản này.
          </p>
        </section>
      ) : null}
    </div>
  );
}
