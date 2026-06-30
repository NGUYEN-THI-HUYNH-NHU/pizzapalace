import Link from "next/link";
import { Github, Mail, MapPin, Phone } from "lucide-react";

const contactLinks = [
  {
    label: "Điện thoại",
    value: "+84 389 390 381",
    href: "tel:+84389390381",
    icon: Phone,
  },
  {
    label: "Email",
    value: "huynhnhu.connect@gmail.com",
    href: "mailto:huynhnhu.connect@gmail.com",
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "github.com/NGUYEN-THI-HUYNH-NHU",
    href: "https://github.com/NGUYEN-THI-HUYNH-NHU",
    icon: Github,
  },
] as const;

const Footer = () => {
  return (
    <footer className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.4fr_1fr] md:px-8 md:py-10">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-yellow-500">
                Pizza Palace
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
                Nguyễn Thị Huỳnh Như
              </h2>
            </div>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
            Sinh viên năm ba ngành Kỹ thuật Phần mềm, có kinh nghiệm với các dự
            án phần mềm đa nền tảng, chuyên sâu về Java cho các hệ thống desktop
            ổn định và Next.js/React cho các ứng dụng web full-stack. Đam mê xây
            dựng kiến trúc hệ thống có khả năng mở rộng, phân tích dữ liệu, và
            chuyển hóa các yêu cầu nghiệp vụ phức tạp thành những giải pháp phần
            mềm hiệu suất cao. Năng lực được chứng minh qua kinh nghiệm trao đổi
            học thuật quốc tế và các dự án nhóm đạt thành tích cao.
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
              <MapPin className="h-4 w-4 text-yellow-500" />
              12, Nguyễn Văn Bảo, Phường Hạnh Thông, TP. Hồ Chí Minh
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
          {contactLinks.map(({ label, value, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors hover:border-yellow-200 hover:bg-yellow-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.28em] text-slate-400">
                  {label}
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-slate-900">
                  {value}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 md:px-8">
        <div className="flex text-sm text-slate-500 md:items-center">
          <p>© 2026 Nguyễn Thị Huỳnh Như. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
