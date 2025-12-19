import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* 브랜드 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-brand-navy">BebeKnock</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              사랑의 노크,<br />
              아이와의 첫 번째 대화
            </p>
          </div>

          {/* 서비스 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground">서비스</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground">법적 고지</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground">고객 지원</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                이메일: kyjneo@gmail.com
              </li>
              <li className="text-sm text-muted-foreground">
                운영시간: 평일 10:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="border-t py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © {currentYear} BebeKnock. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made with ❤️ for parents
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
