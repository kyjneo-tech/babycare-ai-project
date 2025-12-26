import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, MessageSquare, Shield, CheckCircle, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ChatGPT AI 활용 가이드 | BebeKnock',
  description: 'ChatGPT에서 BebeKnock을 사용하는 방법을 알아보세요. 자연어로 아기 활동 기록을 조회하고 관리하세요.',
};

export default function AIGuidePage() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <Link href="/dashboard/settings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            설정으로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">ChatGPT AI 활용 가이드</h1>
        <p className="text-gray-600">ChatGPT와 BebeKnock을 연동하여 음성 또는 채팅으로 아기 활동을 기록하세요</p>
      </div>

      {/* 섹션 1: ChatGPT란? */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            ChatGPT란?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            ChatGPT는 OpenAI에서 개발한 대화형 인공지능입니다. 자연어로 대화하며 정보를 얻거나 작업을 수행할 수 있습니다.
            BebeKnock과 연동하면 "지우 수유 150ml 기록해줘"와 같이 말로만 입력해도 자동으로 활동이 기록됩니다.
          </p>
        </CardContent>
      </Card>

      {/* 섹션 2: 연동 방법 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            BebeKnock과 ChatGPT 연동하기
          </CardTitle>
          <CardDescription>5분이면 설정 완료!</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">ChatGPT 웹사이트 또는 앱 접속</h3>
                <p className="text-gray-600">
                  <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://chat.openai.com
                  </a> 에서 로그인하세요 (무료 계정도 사용 가능)
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">GPTs 메뉴 접속</h3>
                <p className="text-gray-600">
                  좌측 사이드바에서 "Explore GPTs" 또는 "GPTs" 메뉴를 클릭하세요
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">BebeKnock 검색</h3>
                <p className="text-gray-600">
                  검색창에 "BebeKnock"을 입력하거나, 관리자가 제공한 링크를 사용하세요
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Google 계정으로 로그인</h3>
                <p className="text-gray-600">
                  BebeKnock 앱과 <strong>동일한 Google 계정</strong>으로 로그인하면 자동으로 데이터가 동기화됩니다
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold mb-1">완료!</h3>
                <p className="text-gray-600">
                  이제 ChatGPT에서 자연스럽게 대화하며 아기 활동을 기록할 수 있습니다
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* 섹션 3: 사용 예시 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>이렇게 사용해보세요</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">📋 활동 조회</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>"지우 오늘 수유 몇 번 했어?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>"어제 잠은 몇 시간 잤어?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>"최근 기저귀 교체 기록 보여줘"</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <p className="font-semibold text-gray-900 mb-2">✏️ 활동 기록</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"지우 분유 150ml 기록해줘"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"낮잠 2시간 잤어"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"기저귀 교체했어 (소변+대변)"</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 섹션 4: 개인정보 보호 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            개인정보 보호
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>대화 내용은 BebeKnock 서버에 저장되지 않습니다.</strong> ChatGPT와의 대화는 OpenAI의 정책에 따라 처리됩니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>활동 기록만 암호화되어 저장됩니다.</strong> 수유, 수면, 기저귀 교체 등의 데이터는 안전하게 보관됩니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Google OAuth를 통한 안전한 인증:</strong> 비밀번호는 Google이 관리하며, BebeKnock은 접근 권한만 받습니다.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 섹션 5: 자주 묻는 질문 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            자주 묻는 질문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <details className="group">
              <summary className="font-semibold cursor-pointer flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg">
                ChatGPT Plus가 필요한가요?
              </summary>
              <p className="text-gray-600 mt-2 pl-3">
                아니요, <strong>무료 ChatGPT 계정</strong>에서도 BebeKnock을 사용할 수 있습니다. ChatGPT Plus 구독이 없어도 모든 기능을 이용 가능합니다.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold cursor-pointer flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg">
                다른 Google 계정으로 로그인하면 어떻게 되나요?
              </summary>
              <p className="text-gray-600 mt-2 pl-3">
                BebeKnock 앱과 <strong>다른 Google 계정</strong>으로 로그인하면 새로운 계정이 생성됩니다. 기존 데이터를 보려면 앱과 동일한 Google 계정을 사용하세요.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold cursor-pointer flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg">
                음성으로도 입력할 수 있나요?
              </summary>
              <p className="text-gray-600 mt-2 pl-3">
                네! ChatGPT 모바일 앱에서 <strong>음성 입력 기능</strong>을 사용하면 말로만 활동을 기록할 수 있습니다. "지우 수유 200ml 기록해줘"라고 말하면 자동으로 입력됩니다.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold cursor-pointer flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg">
                ChatGPT에서 기록한 내용이 앱에 바로 반영되나요?
              </summary>
              <p className="text-gray-600 mt-2 pl-3">
                네! ChatGPT에서 기록한 활동은 <strong>실시간으로 동기화</strong>됩니다. 앱을 새로고침하면 즉시 확인할 수 있습니다.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold cursor-pointer flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg">
                여러 아기를 관리할 수 있나요?
              </summary>
              <p className="text-gray-600 mt-2 pl-3">
                네! 가족에 등록된 모든 아기의 활동을 관리할 수 있습니다. "지우 수유 기록해줘", "민준이 낮잠 기록해줘"처럼 아기 이름을 함께 말하면 됩니다.
              </p>
            </details>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-orange-50 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">지금 바로 시작해보세요!</h3>
          <p className="text-gray-700 mb-4">
            ChatGPT와 BebeKnock을 연동하고 더 편리하게 육아 기록을 관리하세요
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90">
                <Sparkles className="mr-2 h-4 w-4" />
                ChatGPT 열기
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">
                설정으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
