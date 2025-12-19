import { Metadata } from "next";
import { Footer } from "@/shared/ui/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | BebeKnock",
  description: "BebeKnock 서비스 이용약관입니다.",
};

export default function TermsOfServicePage() {
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
              이용약관
            </h1>
            <p className="text-muted-foreground">
              시행일자: 2025년 1월 1일
            </p>
          </div>

          {/* 내용 */}
          <div className="prose prose-slate max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제1조 (목적)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 약관은 BebeKnock(이하 "회사")가 제공하는 육아 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제2조 (정의)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>"서비스"란 회사가 제공하는 육아 기록 관리, AI 육아 상담, 성장 발달 분석 등의 모든 서비스를 의미합니다.</li>
                <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디(ID)를 부여받은 자를 말합니다.</li>
                <li>"비회원"이란 회원가입 없이 게스트 모드로 서비스를 이용하는 자를 말합니다.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제3조 (약관의 효력 및 변경)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 약관이 변경되는 경우 지체 없이 이를 공지합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                3. 이용자가 변경된 약관에 동의하지 않을 경우, 이용자는 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제4조 (회원가입)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제5조 (서비스의 제공 및 변경)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회사가 제공하는 서비스는 다음과 같습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>육아 활동 기록 및 관리</li>
                <li>AI 기반 육아 상담 및 조언</li>
                <li>성장 발달 분석 및 통계</li>
                <li>가족 구성원 간 정보 공유</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사는 서비스의 내용을 변경할 경우, 변경사항을 서비스 화면에 공지합니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제6조 (서비스의 중단)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상하지 않습니다. 다만, 회사의 고의 또는 중과실에 의한 경우에는 그러하지 아니합니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제7조 (회원의 의무)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회원은 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>신청 또는 변경 시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제8조 (AI 서비스 이용에 관한 주의사항)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 본 서비스가 제공하는 AI 육아 상담은 참고용 정보이며, 의학적 진단이나 치료를 대체할 수 없습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 응급 상황이나 심각한 건강 문제가 발생한 경우 반드시 의료 전문가와 상담하시기 바랍니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                3. AI가 제공하는 정보의 정확성에 대해 회사는 보증하지 않으며, 이로 인한 피해에 대해 책임지지 않습니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제9조 (저작권의 귀속 및 이용제한)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제10조 (분쟁해결)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사와 이용자 간에 발생한 분쟁은 전자거래기본법 제28조 및 동 시행령 제15조에 의하여 설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제11조 (재판권 및 준거법)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회사와 이용자 간에 발생한 전자거래 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사와 이용자 간에 제기된 전자거래 소송에는 대한민국 법원의 관할권이 적용됩니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">제12조 (회원탈퇴 및 자격 상실)</h2>
              <p className="text-muted-foreground leading-relaxed">
                1. 회원은 언제든지 서비스 내 설정을 통해 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자거래질서를 위협하는 경우</li>
                <li>서비스를 이용하여 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
              </ul>
            </section>

            <section className="space-y-4 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                본 약관은 2025년 1월 1일부터 시행됩니다.
              </p>
              <p className="text-sm text-muted-foreground">
                문의사항이 있으시면 <Link href="/contact" className="text-primary hover:underline">문의하기</Link> 페이지를 이용해주세요.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
