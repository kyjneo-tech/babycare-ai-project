import { Metadata } from "next";
import { Footer } from "@/shared/ui/Footer";
import Link from "next/link";
import { Baby, Bot, TrendingUp, Users, Heart, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 소개 | BebeKnock",
  description: "BebeKnock은 AI 기반 스마트 육아 관리 서비스입니다. 아이의 신호를 읽고, 육아를 기록하세요.",
  openGraph: {
    title: "BebeKnock - 사랑의 노크, 아이와의 첫 번째 대화",
    description: "AI 기반 스마트 육아 관리 서비스",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              ← 홈으로 돌아가기
            </Link>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              사랑의 노크,<br />
              아이와의 첫 번째 대화
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              BebeKnock은 초보 부모님들이 아이의 신호를 더 쉽게 이해하고,<br />
              소중한 순간들을 기록할 수 있도록 돕는 AI 육아 동반자입니다.
            </p>
          </div>
        </section>

        {/* 브랜드 스토리 */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">우리의 이야기</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                아이는 태어나는 순간부터 끊임없이 신호를 보냅니다. 때로는 서툰 울음으로, 때로는 작은 몸짓으로 부모님의 마음을 두드리죠(Knock).
                초보 부모에게 그 신호는 때로 어렵고 낯설게 느껴지기도 합니다.
              </p>
              <p>
                BebeKnock의 로고 속에는 엄마와 아빠, 그리고 아이가 서로를 마주 보며 하나의 말풍선 안에 담겨 있습니다.
                이는 <strong>'아이의 신호가 부모에게 닿아 하나의 온전한 소통이 되는 순간'</strong>을 의미합니다.
              </p>
              <p>
                우리는 부모님이 아이의 마음 문을 더 자신 있게 두드릴 수 있도록, 그리고 아이가 보내는 작은 신호들을 놓치지 않고 기록할 수 있도록 돕습니다.
                로고 위의 별들처럼, 당신의 육아가 반짝이는 소중한 기록으로 남을 수 있게 BebeKnock이 곁에서 가이드가 되어드리겠습니다.
              </p>
            </div>
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Baby className="w-8 h-8 text-primary" />}
                title="스마트 육아 기록"
                description="수유, 수면, 기저귀 등 아이의 모든 활동을 간편하게 기록하고 패턴을 분석합니다."
              />
              <FeatureCard
                icon={<Bot className="w-8 h-8 text-secondary-foreground" />}
                title="AI 육아 상담"
                description="24시간 언제든지 궁금한 육아 고민을 AI에게 물어보고 맞춤형 조언을 받으세요."
              />
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8 text-brand-yellow" />}
                title="성장 발달 분석"
                description="아이의 성장 곡선과 발달 단계를 추적하고, 또래와 비교해보세요."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title="가족 공유"
                description="가족 구성원 모두가 함께 아이의 성장을 기록하고 공유할 수 있습니다."
              />
              <FeatureCard
                icon={<Heart className="w-8 h-8 text-destructive" />}
                title="메모 & 사진"
                description="특별한 순간을 사진과 함께 메모로 남기고, 소중한 추억을 만드세요."
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-green-600" />}
                title="프라이버시 보호"
                description="모든 데이터는 암호화되어 안전하게 보관되며, 가족만 열람할 수 있습니다."
              />
            </div>
          </div>
        </section>

        {/* 왜 BebeKnock인가 */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">왜 BebeKnock을 선택해야 할까요?</h2>
            <div className="space-y-8">
              <ReasonCard
                number="01"
                title="초보 부모도 쉽게"
                description="복잡한 육아 앱은 이제 그만. 직관적인 UI로 누구나 쉽게 사용할 수 있습니다."
              />
              <ReasonCard
                number="02"
                title="AI 기반 인사이트"
                description="단순 기록을 넘어 AI가 패턴을 분석하고, 맞춤형 조언을 제공합니다."
              />
              <ReasonCard
                number="03"
                title="가족 중심 설계"
                description="엄마, 아빠, 조부모 모두가 함께 참여할 수 있는 가족 친화적 서비스입니다."
              />
              <ReasonCard
                number="04"
                title="지속적인 업데이트"
                description="사용자 피드백을 반영하여 지속적으로 기능을 개선하고 추가합니다."
              />
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              지금 바로 시작해보세요
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              BebeKnock과 함께 아이의 소중한 순간들을 기록하고,<br />
              더 행복한 육아 여정을 만들어가세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
              >
                시작하기
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-colors"
              >
                문의하기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow">
      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function ReasonCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
