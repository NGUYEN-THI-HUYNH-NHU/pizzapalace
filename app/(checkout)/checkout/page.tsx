'use client';
import React, { useState } from 'react';

export default function CheckoutPage() {
  const [note, setNote] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const paymentOptions = [
    { id: 'cash', label: 'Tiền mặt', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/cash.png' },
    { id: 'zalopay', label: 'ZaloPay', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/ZaloPay_vuong.png' },
    { id: 'momo', label: 'Momo', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/momo.png' },
    { id: 'visa', label: 'ATM/VISA', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/visa.png' },
    { id: 'vnpay', label: 'VNPAY', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/vnpay.png' },
  ];

  return (
    <main className="max-w-[1170px] mx-auto p-4 md:p-6 pt-[88px] md:pt-[110px] bg-gray-50 md:bg-white min-h-screen font-sans text-gray-800">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        
        {/* === CỘT TRÁI: Thông tin giao hàng & Thanh toán === */}
        <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6">
          
          {/* 1. Giao Đến */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center mb-4 cursor-pointer">
              <div>
                <h6 className="text-base md:text-xl font-semibold text-black">Giao đến</h6>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="text-gray-400">
                <path fill="currentColor" d="M8.822 19.116a.7.7 0 0 1-.45-.169.63.63 0 0 1 0-.9L14.278 12 8.372 5.981a.63.63 0 0 1 0-.9.63.63 0 0 1 .9 0l6.356 6.47a.63.63 0 0 1 0 .9l-6.356 6.468a.66.66 0 0 1-.45.197"></path>
              </svg>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <p className="md:text-lg font-medium text-black">4/3 Đ. Số 7, Phường 3, Gò Vấp, Hồ Chí Minh, Việt Nam</p>
              
              <div className="mt-2 md:mt-0">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-black">Ghi chú</label>
                  <span className="text-sm text-gray-500 font-medium">{note.length}/200</span>
                </div>
                <input
                  type="text"
                  placeholder="Ghi chú cho giao hàng, ví dụ: tầng, phòng..."
                  maxLength={200}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="hidden md:block mt-2">
                <label className="block text-sm font-medium mb-2 text-black">Thời gian nhận</label>
                <button type="button" className="w-full p-3 border border-gray-300 rounded-md flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <span className="text-base text-black font-normal">Ngay lập tức</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path fill="#637381" d="m2.296 5.154.005.004 5.35 5.225.35.343.35-.345 5.35-5.275.002-.002c.019-.019.036-.023.047-.023s.028.004.046.023l.352-.352-.352.352c.019.018.023.035.023.046s-.004.027-.022.046L8.05 10.843l-.003.004a.4.4 0 0 1-.06.052l-.017-.004a.2.2 0 0 1-.04-.023L2.203 5.246c-.018-.019-.022-.035-.022-.046s.004-.028.022-.046c.019-.019.036-.023.047-.023s.028.004.046.023Z"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Người đặt hàng */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="mb-4 md:mb-6">
              <h6 className="text-base md:text-xl font-semibold text-black">Người đặt hàng</h6>
              <p className="text-sm text-gray-500 mt-1">Thông tin được dùng để tích lũy điểm thành viên</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nhập đầy đủ họ tên của bạn"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute left-0 top-0 bottom-0 w-[50px] flex items-center justify-center bg-gray-100 border border-gray-300 border-r-0 rounded-l-md text-sm text-black select-none pointer-events-none">+84</span>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại của bạn"
                    className="w-full py-3 pr-3 pl-[65px] border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h6 className="text-base md:text-xl font-semibold text-black">Phương thức thanh toán</h6>
              <div className="md:hidden flex items-center text-sm font-medium">
                Tiền mặt
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="ml-1"><path fill="#637381" d="M8.822 19.116a.7.7 0 0 1-.45-.169.63.63 0 0 1 0-.9L14.278 12 8.372 5.981a.63.63 0 0 1 0-.9.63.63 0 0 1 .9 0l6.356 6.47a.63.63 0 0 1 0 .9l-6.356 6.468a.66.66 0 0 1-.45.197"></path></svg>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-5">
              {paymentOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value={option.id}
                      className="peer appearance-none w-5 h-5 border border-gray-300 rounded-full checked:border-red-600 checked:border-[5px] transition-all cursor-pointer"
                      checked={paymentMethod === option.id}
                      onChange={() => setPaymentMethod(option.id)}
                    />
                  </div>
                  <div className="flex items-center gap-4 ml-2">
                    <img src={option.icon} alt={option.label} className="w-9 h-9 object-contain" />
                    <span className="text-sm font-medium text-black">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI: Khuyến mãi & Tổng kết === */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 md:gap-6">
          
          {/* 4. Voucher */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none cursor-pointer">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-base md:text-xl font-semibold text-black">Voucher</h6>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="text-gray-400">
                <path fill="currentColor" d="M8.822 19.116a.7.7 0 0 1-.45-.169.63.63 0 0 1 0-.9L14.278 12 8.372 5.981a.63.63 0 0 1 0-.9.63.63 0 0 1 .9 0l6.356 6.47a.63.63 0 0 1 0 .9l-6.356 6.468a.66.66 0 0 1-.45.197"></path>
              </svg>
            </div>
            <p className="text-red-600 text-sm font-medium">Nhập hoặc chọn voucher của bạn</p>
          </div>

          {/* 5. Giỏ hàng & Tạm tính */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center cursor-pointer mb-1">
              <h6 className="text-base md:text-xl font-semibold text-black">Giỏ hàng của tôi</h6>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="text-gray-400">
                <path fill="currentColor" d="M8.822 19.116a.7.7 0 0 1-.45-.169.63.63 0 0 1 0-.9L14.278 12 8.372 5.981a.63.63 0 0 1 0-.9.63.63 0 0 1 .9 0l6.356 6.47a.63.63 0 0 1 0 .9l-6.356 6.468a.66.66 0 0 1-.45.197"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-600">Có 3 sản phẩm trong giỏ hàng của bạn</p>
            
            <div className="w-full h-[1px] bg-gray-200 my-4"></div>
            
            <div className="flex flex-col gap-3 pb-4 text-black">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Tạm tính</p>
                <p className="text-sm md:text-base font-semibold">117.000 ₫</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Giảm giá thành viên</p>
                <p className="text-sm md:text-base font-semibold text-green-600">0 ₫</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Phí giao hàng</p>
                <p className="text-sm md:text-base font-semibold">0 ₫</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
              <p className="font-medium text-black">Tổng cộng</p>
              <p className="text-xl md:text-3xl font-bold text-black">117.000 ₫</p>
            </div>

            <div className="mt-2 text-sm text-gray-500 flex justify-end items-center gap-1">
              <span>Nhận</span>
              <span className="font-semibold text-black">11 điểm</span>
              <span>PizzaPalace rewards</span>
            </div>
          </div>

          {/* 6. Đồng ý điều khoản */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-5 h-5 mt-0.5 text-red-600 border-gray-300 rounded focus:ring-red-600"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="text-sm text-black leading-relaxed font-normal">
                Tôi đồng ý với <a href="#" className="text-red-600 underline">các điều khoản và điều kiện</a> và tham gia <a href="#" className="text-red-600 underline">chương trình thành viên PizzaPalace Rewards</a> để tích điểm và hưởng quyền lợi theo quy định của chương trình.
              </span>
            </label>
          </div>

          {/* 7. Nút Đặt Hàng */}
          <div className="bg-white md:bg-transparent p-4 md:p-0">
            <button 
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                agreedToTerms 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-300 cursor-not-allowed pointer-events-none'
              }`}
              disabled={!agreedToTerms}
            >
              <span className="text-base font-medium">Đặt hàng</span>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}