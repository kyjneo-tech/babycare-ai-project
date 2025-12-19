import { Metadata } from "next";
import { Footer } from "@/shared/ui/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | BebeKnock",
  description: "BebeKnock의 개인정보 수집 및 이용에 관한 방침입니다.",
};

export default function PrivacyPolicyPage() {
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
              개인정보처리방침
            </h1>
            <p className="text-muted-foreground">
              시행일자: 2025년 1월 1일
            </p>
          </div>

          {/* 내용 */}
          <div className="prose prose-slate max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. 개인정보의 수집 및 이용 목적</h2>
              <p className="text-muted-foreground leading-relaxed">
                BebeKnock(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                <li>서비스 제공: 육아 기록 관리, AI 기반 육아 상담, 성장 발달 분석 서비스 제공</li>
                <li>마케팅 및 광고 활용: 이벤트 및 광고성 정보 제공 및 참여 기회 제공</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. 수집하는 개인정보 항목</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">필수 수집 항목</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>회원가입 시: 이메일, 비밀번호, 이름</li>
                  <li>소셜 로그인 시: 이메일, 프로필 정보 (구글, 카카오 제공 정보)</li>
                  <li>서비스 이용 시: 아기 정보(이름, 생년월일, 성별), 육아 활동 기록</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">자동 수집 항목</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                  <li>기기 정보 (OS, 브라우저 종류)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보존)</li>
                <li>전자상거래법에 따른 보존: 계약 또는 청약철회 등에 관한 기록 5년</li>
                <li>통신비밀보호법에 따른 보존: 로그인 기록 3개월</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. 개인정보의 제3자 제공</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. 개인정보 처리 위탁</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 외부 전문업체에 위탁하여 운영하고 있습니다:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-2 text-left">수탁업체</th>
                      <th className="border border-border px-4 py-2 text-left">위탁 업무 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2">Google (Gemini API)</td>
                      <td className="border border-border px-4 py-2">AI 육아 상담 서비스 제공</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Vercel</td>
                      <td className="border border-border px-4 py-2">웹 호스팅 및 서버 운영</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Supabase</td>
                      <td className="border border-border px-4 py-2">데이터베이스 관리</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-muted-foreground leading-relaxed">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                권리 행사는 서비스 내 설정 메뉴 또는 개인정보 보호책임자에게 서면, 전화, 이메일 등을 통하여 하실 수 있습니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">7. 개인정보의 파기</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>파기 절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 파기됩니다.</li>
                <li>파기 방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">8. 개인정보 보호책임자</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold">개인정보 보호책임자</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>이메일: privacy@bebeknock.com</li>
                  <li>연락처: 문의하기 페이지를 통해 접수 가능</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">9. 쿠키의 운영</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>쿠키란: 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에게 보내는 작은 텍스트 파일</li>
                <li>이용 목적: 로그인 세션 유지, 서비스 이용 편의성 향상</li>
                <li>거부 방법: 웹브라우저 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">10. 광고 서비스</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 서비스는 Google AdMob을 통해 모바일 애플리케이션 내 광고를 제공할 수 있습니다. Google AdMob은 광고 식별자(Google Advertising ID)를 사용하여 사용자의 앱 사용 기록을 기반으로 맞춤형 광고를 게재합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>사용자는 기기 설정에서 광고 맞춤 설정을 끄거나 광고 ID를 재설정할 수 있습니다.</li>
                <li>Android: 설정 → Google → 광고 → 광고 맞춤설정 선택 해제</li>
                <li>Google AdMob 정책: <a href="https://support.google.com/admob/answer/6128543" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://support.google.com/admob/answer/6128543</a></li>
                <li>Google의 개인정보 보호정책: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">11. 개인정보처리방침의 변경</h2>
              <p className="text-muted-foreground leading-relaxed">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
