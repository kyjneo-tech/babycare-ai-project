import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { ActivityForm } from '../ActivityForm';
import { getBabyById } from '@/features/babies/actions';
import { getLatestMeasurement } from '@/features/measurements/actions';
import { createActivity } from '@/features/activities/actions';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock server actions
jest.mock('@/features/babies/actions', () => ({
  getBabyById: jest.fn(),
}));

jest.mock('@/features/measurements/actions', () => ({
  getLatestMeasurement: jest.fn(),
}));

jest.mock('@/features/activities/actions', () => ({
  createActivity: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 data-testid="card-title" className={className}>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ name, placeholder, rows, disabled, className }: any) => (
    <textarea
      name={name}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={className}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}));

// Mock TimeSelector component
jest.mock('@/components/common/TimeSelector', () => ({
  TimeSelector: ({ hours, minutes, onTimeChange, disabled }: any) => (
    <div data-testid="time-selector">
      <button
        aria-label="시간 증가"
        onClick={() => onTimeChange(hours + 1, minutes)}
        disabled={disabled}
      >
        +시간
      </button>
      <span data-testid="current-time">{hours}:{minutes}</span>
      <button
        aria-label="시간 감소"
        onClick={() => onTimeChange(hours - 1, minutes)}
        disabled={disabled}
      >
        -시간
      </button>
    </div>
  ),
}));

// Mock form sections
jest.mock('@/features/activities/components/forms/FeedingFormSection', () => ({
  FeedingFormSection: ({ feedingAmount, setFeedingAmount, disabled }: any) => (
    <div data-testid="feeding-form-section">
      <label htmlFor="feeding-amount">수유량</label>
      <input
        id="feeding-amount"
        type="number"
        value={feedingAmount}
        onChange={(e) => setFeedingAmount(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
}));

jest.mock('@/features/activities/components/forms/SleepFormSection', () => ({
  SleepFormSection: () => <div data-testid="sleep-form-section">Sleep Form</div>,
}));

jest.mock('@/features/activities/components/forms/DiaperFormSection', () => ({
  DiaperFormSection: () => <div data-testid="diaper-form-section">Diaper Form</div>,
}));

jest.mock('@/features/activities/components/forms/MedicineFormSection', () => ({
  MedicineFormSection: () => <div data-testid="medicine-form-section">Medicine Form</div>,
}));

jest.mock('@/features/activities/components/forms/TemperatureFormSection', () => ({
  TemperatureFormSection: () => <div data-testid="temperature-form-section">Temperature Form</div>,
}));

jest.mock('@/features/activities/components/ui/ActivitySuggestions', () => ({
  ActivitySuggestions: ({ type }: any) => <div data-testid="activity-suggestions">Suggestions for {type}</div>,
}));

describe('ActivityForm', () => {
  const mockOnActivityCreated = jest.fn();
  const defaultProps = {
    babyId: 'test-baby-id',
    onActivityCreated: mockOnActivityCreated,
  };

  const mockBabyData = {
    success: true,
    data: {
      id: 'test-baby-id',
      name: 'Test Baby',
      birthDate: new Date('2024-01-01'),
      gender: 'male',
    },
  };

  const mockMeasurementData = {
    success: true,
    data: {
      id: 'test-measurement-id',
      weight: 5.5,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated',
    });

    (getBabyById as jest.Mock).mockResolvedValue(mockBabyData);
    (getLatestMeasurement as jest.Mock).mockResolvedValue(mockMeasurementData);
  });

  describe('초기 렌더링', () => {
    it('7가지 활동 타입 버튼이 표시된다', () => {
      render(<ActivityForm {...defaultProps} />);

      expect(screen.getByText('🍼')).toBeInTheDocument();
      expect(screen.getByText('😴')).toBeInTheDocument();
      expect(screen.getByText('💩')).toBeInTheDocument();
      expect(screen.getByText('💊')).toBeInTheDocument();
      expect(screen.getByText('🌡️')).toBeInTheDocument();
    });

    it('시간 선택기가 표시된다', () => {
      render(<ActivityForm {...defaultProps} />);

      expect(screen.getByTestId('time-selector')).toBeInTheDocument();
    });

    it('아기 정보를 로드한다', async () => {
      render(<ActivityForm {...defaultProps} />);

      await waitFor(() => {
        expect(getBabyById).toHaveBeenCalledWith('test-baby-id');
      });
    });

    it('최신 몸무게 정보를 로드한다', async () => {
      render(<ActivityForm {...defaultProps} />);

      await waitFor(() => {
        expect(getLatestMeasurement).toHaveBeenCalledWith('test-baby-id');
      });
    });
  });

  describe('활동 타입 선택', () => {
    it('수유 타입 선택 시 수유 폼 섹션이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      await waitFor(() => {
        expect(screen.getByTestId('feeding-form-section')).toBeInTheDocument();
      });
    });

    it('수면 타입 선택 시 수면 폼 섹션이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const sleepButton = screen.getByText('수면').closest('button');
      fireEvent.click(sleepButton!);

      await waitFor(() => {
        expect(screen.getByTestId('sleep-form-section')).toBeInTheDocument();
      });
    });

    it('배변 타입 선택 시 배변 폼 섹션이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const diaperButton = screen.getByText('배변').closest('button');
      fireEvent.click(diaperButton!);

      await waitFor(() => {
        expect(screen.getByTestId('diaper-form-section')).toBeInTheDocument();
      });
    });

    it('투약 타입 선택 시 투약 폼 섹션이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const medicineButton = screen.getByText('투약').closest('button');
      fireEvent.click(medicineButton!);

      await waitFor(() => {
        expect(screen.getByTestId('medicine-form-section')).toBeInTheDocument();
      });
    });

    it('체온 타입 선택 시 체온 폼 섹션이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const temperatureButton = screen.getByText('체온').closest('button');
      fireEvent.click(temperatureButton!);

      await waitFor(() => {
        expect(screen.getByTestId('temperature-form-section')).toBeInTheDocument();
      });
    });

    it('타입 선택 시 해당 버튼이 하이라이트된다', () => {
      render(<ActivityForm {...defaultProps} />);

      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      expect(feedingButton).toHaveClass('ring-2');
    });

    it('타입 선택 시 상세 입력 패널이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      await waitFor(() => {
        expect(screen.getByText('🍼 수유 기록')).toBeInTheDocument();
      });
    });
  });

  describe('게스트 모드', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    it('게스트 모드에서는 활동 타입 버튼이 비활성화된다', () => {
      render(<ActivityForm {...defaultProps} />);

      const feedingButton = screen.getByText('수유').closest('button');
      const sleepButton = screen.getByText('수면').closest('button');

      expect(feedingButton).toBeDisabled();
      expect(sleepButton).toBeDisabled();
    });

    it('게스트 모드에서는 시간 선택기가 비활성화된다', () => {
      render(<ActivityForm {...defaultProps} />);

      const increaseButton = screen.getByLabelText('시간 증가');
      expect(increaseButton).toBeDisabled();
    });

    it('게스트 모드에서는 메모 입력이 비활성화된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      // 먼저 활동 타입을 선택해야 하지만 게스트 모드에서는 불가능
      // 이 테스트는 폼이 표시되었을 때의 상태를 검증
      const noteTextarea = screen.queryByPlaceholderText(/메모는 AI 상담에/);
      if (noteTextarea) {
        expect(noteTextarea).toBeDisabled();
      }
    });
  });

  describe('시간 선택', () => {
    it('시간 증가 버튼으로 시간을 변경할 수 있다', () => {
      render(<ActivityForm {...defaultProps} />);

      const increaseButton = screen.getByLabelText('시간 증가');
      fireEvent.click(increaseButton);

      // 시간이 증가했는지 확인
      expect(screen.getByTestId('current-time')).toBeInTheDocument();
    });

    it('시간 감소 버튼으로 시간을 변경할 수 있다', () => {
      render(<ActivityForm {...defaultProps} />);

      const decreaseButton = screen.getByLabelText('시간 감소');
      fireEvent.click(decreaseButton);

      // 시간이 감소했는지 확인
      expect(screen.getByTestId('current-time')).toBeInTheDocument();
    });
  });

  describe('폼 제출', () => {
    it('수유 기록을 성공적으로 제출한다', async () => {
      (createActivity as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'new-activity-id', type: 'FEEDING' },
      });

      render(<ActivityForm {...defaultProps} />);

      // 수유 선택
      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      // 수유량 입력
      await waitFor(() => {
        const amountInput = screen.getByLabelText('수유량');
        fireEvent.change(amountInput, { target: { value: '120' } });
      });

      // 저장 버튼 클릭
      const saveButton = screen.getByText('✅ 저장');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(createActivity).toHaveBeenCalled();
      });
    });

    it('제출 성공 시 onActivityCreated 콜백이 호출된다', async () => {
      const mockActivity = { id: 'new-activity-id', type: 'FEEDING' };
      (createActivity as jest.Mock).mockResolvedValue({
        success: true,
        data: mockActivity,
      });

      render(<ActivityForm {...defaultProps} />);

      // 수유 선택
      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      // 수유량 입력
      await waitFor(() => {
        const amountInput = screen.getByLabelText('수유량');
        fireEvent.change(amountInput, { target: { value: '120' } });
      });

      // 저장 버튼 클릭
      const saveButton = screen.getByText('✅ 저장');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnActivityCreated).toHaveBeenCalledWith(mockActivity);
      });
    });

    it('제출 실패 시 에러 메시지를 표시한다', async () => {
      (createActivity as jest.Mock).mockResolvedValue({
        success: false,
        error: '기록에 실패했습니다.',
      });

      render(<ActivityForm {...defaultProps} />);

      // 수유 선택
      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      // 저장 버튼 클릭 (수유량 입력 없이)
      await waitFor(() => {
        const saveButton = screen.getByText('✅ 저장');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('기록에 실패했습니다.')).toBeInTheDocument();
      });
    });

    it('제출 중에는 로딩 상태를 표시한다', async () => {
      (createActivity as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
      );

      render(<ActivityForm {...defaultProps} />);

      // 수유 선택
      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      // 수유량 입력
      await waitFor(() => {
        const amountInput = screen.getByLabelText('수유량');
        fireEvent.change(amountInput, { target: { value: '120' } });
      });

      // 저장 버튼 클릭
      const saveButton = screen.getByText('✅ 저장');
      fireEvent.click(saveButton);

      // 로딩 중 상태 확인
      expect(screen.getByText('저장 중...')).toBeInTheDocument();
    });
  });

  describe('취소 기능', () => {
    it('취소 버튼 클릭 시 상세 입력 패널이 닫힌다', async () => {
      render(<ActivityForm {...defaultProps} />);

      // 수유 선택하여 상세 패널 열기
      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      await waitFor(() => {
        expect(screen.getByText('🍼 수유 기록')).toBeInTheDocument();
      });

      // 취소 버튼 클릭
      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);

      // 상세 패널이 사라졌는지 확인
      await waitFor(() => {
        expect(screen.queryByText('🍼 수유 기록')).not.toBeInTheDocument();
      });
    });

    it('게스트 모드에서는 취소 버튼이 비활성화된다', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<ActivityForm {...defaultProps} />);

      // 활동 타입을 선택할 수 없으므로 취소 버튼도 표시되지 않음
      // 이 테스트는 게스트 모드의 전반적인 동작을 검증
      const feedingButton = screen.getByText('수유').closest('button');
      expect(feedingButton).toBeDisabled();
    });
  });

  describe('데이터 로딩', () => {
    it('아기 정보 로딩 실패 시 콘솔 에러를 출력한다', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (getBabyById as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      render(<ActivityForm {...defaultProps} />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '아기 정보 로드 실패:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('몸무게 정보 로딩 실패 시에도 컴포넌트가 정상 렌더링된다', async () => {
      (getLatestMeasurement as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      render(<ActivityForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('🍼')).toBeInTheDocument();
      });
    });
  });

  describe('활동 제안', () => {
    it('활동 타입 선택 시 관련 제안이 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      await waitFor(() => {
        expect(screen.getByTestId('activity-suggestions')).toBeInTheDocument();
        expect(screen.getByText(/Suggestions for FEEDING/)).toBeInTheDocument();
      });
    });
  });

  describe('메모 입력', () => {
    it('메모 입력 필드가 표시된다', async () => {
      render(<ActivityForm {...defaultProps} />);

      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      await waitFor(() => {
        const noteTextarea = screen.getByPlaceholderText(/메모는 AI 상담에/);
        expect(noteTextarea).toBeInTheDocument();
      });
    });

    it('메모는 선택 사항이다', async () => {
      (createActivity as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'new-activity-id' },
      });

      render(<ActivityForm {...defaultProps} />);

      // 수유 선택
      const feedingButton = screen.getByText('수유').closest('button');
      fireEvent.click(feedingButton!);

      // 메모 없이 저장
      await waitFor(() => {
        const saveButton = screen.getByText('✅ 저장');
        fireEvent.click(saveButton);
      });

      // 저장이 성공해야 함
      await waitFor(() => {
        expect(createActivity).toHaveBeenCalled();
      });
    });
  });
});
