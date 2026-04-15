// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { CartItem } from '@/contexts/cart-context';
// import { X, Minus, Plus } from 'lucide-react';
// import getCrusts from '@/actions/get-crusts';
// import { PizzaVariant } from '@/type';

// type EditCartItemModalProps = {
//   item: CartItem | null;
//   open: boolean;
//   onClose: () => void;
//   onSave: (updates: {
//     quantity: number;
//     size?: string;
//     crust?: string;
//     price: number;
//     sku?: string;
//     variantId?: string;
//   }) => void;
//   onRemove: () => void;
// };

// const formatPrice = (price: number) =>
//   new Intl.NumberFormat('vi-VN', {
//     style: 'currency',
//     currency: 'VND',
//     maximumFractionDigits: 0,
//   }).format(price);

// export default function EditCartItemModal({
//   item,
//   open,
//   onClose,
//   onSave,
//   onRemove,
// }: EditCartItemModalProps) {
//   const [quantity, setQuantity] = useState(1);
//   const [selectedSize, setSelectedSize] = useState('');
//   const [selectedCrust, setSelectedCrust] = useState('');
//   const [crustsMap, setCrustsMap] = useState<Record<string, string>>({});

//   useEffect(() => {
//     const fetchCrusts = async () => {
//       try {
//         const data = await getCrusts();
//         const map: Record<string, string> = {};
//         data.forEach((c) => (map[c.code] = c.name));
//         setCrustsMap(map);
//       } catch (error) {
//         console.error('Fetch crusts failed:', error);
//       }
//     };

//     fetchCrusts();
//   }, []);

//   useEffect(() => {
//     if (item) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setQuantity(item.quantity);
//       setSelectedSize(item.size || item.pizzaDetails?.sizes?.[0] || '');
//       setSelectedCrust(
//         item.crust || item.pizzaDetails?.variants?.find((variant) => variant.size === item.size)?.crust || ''
//       );
//     }
//   }, [item]);

//   const sizes = useMemo(() => item?.pizzaDetails?.sizes || [], [item?.pizzaDetails?.sizes]);
//   const variants = useMemo(() => item?.pizzaDetails?.variants || [], [item?.pizzaDetails?.variants]);

//   const selectedVariant: PizzaVariant | undefined = useMemo(() => {
//     if (!variants.length) return undefined;
//     return variants.find(
//       (variant) =>
//         variant.size === selectedSize &&
//         variant.crust === selectedCrust &&
//         variant.isAvailable
//     );
//   }, [variants, selectedSize, selectedCrust]);

//   const finalPrice = selectedVariant?.price || item?.price || 0;
//   const totalPrice = finalPrice * quantity;

//   if (!open || !item) return null;

//   const crustsForSize = variants
//     .filter((variant) => variant.size === selectedSize && variant.isAvailable)
//     .map((variant) => variant.crust);

//   const handleSave = () => {
//     onSave({
//       quantity,
//       size: selectedSize,
//       crust: selectedCrust,
//       price: finalPrice,
//       sku: selectedVariant?.sku,
//       variantId: selectedVariant?.sku || `${selectedSize}-${selectedCrust}`,
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
//       <div className="relative w-full max-w-xl h-[640px] rounded-2xl bg-white shadow-xl overflow-hidden">
//         <button
//           type="button"
//           onClick={onClose}
//           className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100"
//         >
//           <X className="h-4 w-4" />
//         </button>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
//           <div className="overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
//             {item.image ? (
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="h-[250px] w-full object-cover rounded-xl"
//               />
//             ) : (
//               <div className="text-4xl">🍕</div>
//             )}
//           </div>

//           <div className="flex flex-col h-full">
//             <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa {item.name}</h2>
//             <p className="mt-1 text-xs text-gray-600">{item.description}</p>

//             {sizes.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="mb-2 text-xs font-semibold text-gray-700">Kích thước</h3>
//                 <div className="grid grid-cols-3 gap-2">
//                   {sizes.map((size) => (
//                     <button
//                       key={size}
//                       type="button"
//                       onClick={() => setSelectedSize(size)}
//                       className={`rounded-lg border px-3 py-1 text-xs ${selectedSize === size ? 'bg-red-600 text-white' : 'border-gray-300'
//                         }`}
//                     >
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {crustsForSize.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="mb-2 text-xs font-semibold text-gray-700">Đế bánh</h3>
//                 <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
//                   <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
//                     {crustsForSize.map((crust) => {
//                       const variantPrice =
//                         variants.find(
//                           (variant) =>
//                             variant.size === selectedSize &&
//                             variant.crust === crust &&
//                             variant.isAvailable
//                         )?.price || item.price;

//                       return (
//                         <button
//                           key={crust}
//                           type="button"
//                           onClick={() => setSelectedCrust(crust)}
//                           className={`flex w-full justify-between rounded-lg border px-3 py-2 text-xs ${selectedCrust === crust ? 'border-red-500 bg-red-50' : ''
//                             }`}
//                         >
//                           <span>{crustsMap[crust] || crust}</span>
//                           <span>{formatPrice(variantPrice)}</span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="mt-4 flex items-center justify-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                 className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
//                 aria-label="Giảm số lượng"
//               >
//                 <Minus className="h-4 w-4" />
//               </button>
//               <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
//               <button
//                 type="button"
//                 onClick={() => setQuantity(quantity + 1)}
//                 className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
//                 aria-label="Tăng số lượng"
//               >
//                 <Plus className="h-4 w-4" />
//               </button>
//             </div>

//             <div className="mt-4">
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white"
//               >
//                 Lưu - {formatPrice(totalPrice)}
//               </button>
//             </div>

//             <button
//               type="button"
//               onClick={onRemove}
//               className="mt-3 w-full rounded-lg border border-red-300 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
//             >
//               Xóa sản phẩm khỏi giỏ hàng
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
