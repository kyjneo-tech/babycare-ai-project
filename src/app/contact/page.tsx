import { Metadata } from "next";
import { Footer } from "@/shared/ui/Footer";
import Link from "next/link";
import { Mail, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "문의하기 | BebeKnock",
  description: "BebeKnock 고객센터입니다. 궁금한 사항을 문의해주세요.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* 헤더 */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 홈으로 돌아가기
            </Link>
            <h1 className="text-4xl font-black text-foreground">
              문의하기
            </h1>
            <p className="text-lg text-muted-foreground">
              궁금한 사항이 있으시면 언제든지 문의해주세요.
            </p>
          </div>

          {/* 문의 방법 */}
          <div className="grid md:grid-cols-3 gap-6">
            <ContactMethod
              icon={<Mail className="w-6 h-6" />}
              title="이메일 문의"
              description="kyjneo@gmail.com"
              detail="영업일 기준 24시간 이내 답변"
            />
            <ContactMethod
              icon={<Clock className="w-6 h-6" />}
              title="운영 시간"
              description="평일 10:00 - 18:00"
              detail="주말 및 공휴일 휴무"
            />
            <ContactMethod
              icon={<MessageCircle className="w-6 h-6" />}
              title="빠른 문의"
              description="서비스 내 채팅"
              detail="로그인 후 AI 상담 이용"
            />
          </div>

          {/* 문의 폼 */}
          <div className="bg-muted/30 border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">이메일로 문의하기</h2>
            <div className="space-y-4">
              <div className="bg-background p-6 rounded-lg border border-border">
                <p className="text-muted-foreground leading-relaxed">
                  아래 이메일 주소로 문의사항을 보내주시면<br />
                  영업일 기준 24시간 이내에 답변드리겠습니다.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <a
                    href="mailto:kyjneo@gmail.com"
                    className="text-primary font-semibold hover:underline"
                  >
                    kyjneo@gmail.com
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">문의 시 포함해주세요</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>문의 제목 (간단 명료하게)</li>
                  <li>문의 내용 (상세하게)</li>
                  <li>회원 이메일 (가입하신 경우)</li>
                  <li>문제 발생 시 스크린샷 (해당되는 경우)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 자주 묻는 질문 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">자주 묻는 질문 (FAQ)</h2>
            <div className="space-y-4">
              <FAQItem
                question="서비스 이용은 무료인가요?"
                answer="네, BebeKnock의 기본 기능은 모두 무료로 이용하실 수 있습니다. 추후 프리미엄 기능이 추가될 수 있습니다."
              />
              <FAQItem
                question="가족 구성원은 몇 명까지 초대할 수 있나요?"
                answer="제한 없이 가족 구성원을 초대하실 수 있습니다. 엄마, 아빠, 조부모 등 누구나 함께 아이의 성장을 기록할 수 있습니다."
              />
              <FAQItem
                question="아기는 몇 명까지 등록할 수 있나요?"
                answer="한 가족 계정에 여러 명의 아기를 등록하실 수 있습니다. 쌍둥이나 형제자매 모두 함께 관리하세요."
              />
              <FAQItem
                question="AI 상담은 얼마나 정확한가요?"
                answer="AI 상담은 참고용 정보로, 의학적 진단이나 치료를 대체할 수 없습니다. 응급 상황이나 심각한 건강 문제는 반드시 의료 전문가와 상담하세요."
              />
              <FAQItem
                question="데이터는 안전하게 보관되나요?"
                answer="네, 모든 데이터는 암호화되어 안전하게 보관됩니다. 가족 구성원만 열람할 수 있으며, 제3자에게 공유되지 않습니다."
              />
              <FAQItem
                question="회원 탈퇴 시 데이터는 어떻게 되나요?"
                answer="회원 탈퇴 시 모든 개인 데이터는 즉시 삭제됩니다. 법적 보관 의무가 있는 경우 별도로 분리 보관 후 기간 만료 시 파기됩니다."
              />
            </div>
          </div>

          {/* 추가 링크 */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-2xl border border-primary/20">
            <h3 className="text-xl font-bold mb-4">더 많은 정보가 필요하신가요?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="px-6 py-3 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-center font-semibold"
              >
                서비스 소개 보기
              </Link>
              <Link
                href="/privacy-policy"
                className="px-6 py-3 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-center font-semibold"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms-of-service"
                className="px-6 py-3 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-center font-semibold"
              >
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ContactMethod({
  icon,
  title,
  description,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <div className="bg-background p-6 rounded-2xl border border-border">
      <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground font-semibold mb-1">{description}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
      <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
        <span>{question}</span>
        <span className="ml-2 transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>
      <p className="mt-4 text-muted-foreground leading-relaxed">{answer}</p>
    </details>
  );
}
