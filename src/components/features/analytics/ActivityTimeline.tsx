// src/components/features/analytics/ActivityTimeline.tsx
import React from 'react';
import { Activity, ActivityType } from '@prisma/client';
import { PredictedActivityPatterns, PredictedPattern } from '@/shared/types/schemas';

interface ActivityTimelineProps {
  date: Date;
  activities: Activity[];
  predictedPatterns?: PredictedActivityPatterns;
  isToday?: boolean;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.FEEDING:
      return '🍼';
    case ActivityType.SLEEP:
      return '😴';
    case ActivityType.DIAPER:
      return '💩';
    case ActivityType.BATH:
      return '🛁';
    case ActivityType.PLAY:
      return '🧸';
    case ActivityType.MEDICINE:
      return '💊';
    default:
      return '📝';
  }
};

const formatActivityDetails = (activity: Activity) => {
  switch (activity.type) {
    case ActivityType.FEEDING:
      return `${activity.feedingType || ''} ${activity.feedingAmount ? activity.feedingAmount + 'ml' : ''} ${activity.breastSide || ''}`;
    case ActivityType.SLEEP:
      if (activity.endTime && activity.startTime) {
        const startTime = new Date(activity.startTime);
        const endTime = new Date(activity.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${activity.sleepType || ''} ${hours > 0 ? hours + '시간' : ''} ${minutes > 0 ? minutes + '분' : ''}`;
      }
      return `${activity.sleepType || ''}`;
    case ActivityType.DIAPER:
      return `${activity.diaperType || ''} ${activity.stoolColor || ''}`;
    case ActivityType.BATH:
      return `${activity.bathType || ''}`;
    case ActivityType.PLAY:
      return `${activity.playType || ''} ${activity.playDuration ? activity.playDuration + '분' : ''}`;
    case ActivityType.MEDICINE:
      return `${activity.medicineName || ''} ${activity.medicineAmount || ''} ${activity.medicineUnit || ''}`;
    default:
      return activity.note || '';
  }
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ date, activities, predictedPatterns, isToday = false }) => {
  const sortedActivities = [...activities].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // 예측 데이터를 activities에 통합
  const timelineItems: (Activity | { type: ActivityType; time: Date; isPrediction: true; details: PredictedPattern })[] = [
    ...sortedActivities
  ];

  if (isToday && predictedPatterns) {
    Object.entries(predictedPatterns).forEach(([type, prediction]) => {
      if (prediction && prediction.nextTime) {
        timelineItems.push({
          type: type as ActivityType,
          time: prediction.nextTime,
          isPrediction: true,
          details: prediction
        });
      }
    });
  }

  // 시간 순으로 다시 정렬
  timelineItems.sort((a, b) => {
    const timeA = (a as Activity).createdAt ? new Date((a as Activity).createdAt).getTime() : (a as any).time?.getTime();
    const timeB = (b as Activity).createdAt ? new Date((b as Activity).createdAt).getTime() : (b as any).time?.getTime();
    return timeA - timeB;
  });


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {date.toLocaleDateString("ko-KR")} 활동 기록 {isToday && predictedPatterns && '(예측 포함)'}
      </h2>
      {timelineItems.length > 0 ? (
        <div className="space-y-4">
          {timelineItems.map((item, index) => {
            const isPrediction = 'isPrediction' in item && item.isPrediction;
            const activityTime = new Date(isPrediction ? item.time : (item as Activity).createdAt);
            const detailText = isPrediction 
              ? `${item.type === ActivityType.FEEDING ? (item.details.avgAmount ? item.details.avgAmount + 'ml' : '') : ''} ${item.type === ActivityType.SLEEP ? (item.details.avgDuration ? item.details.avgDuration + '분' : '') : ''}`.trim()
              : formatActivityDetails(item as Activity);

            return (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-2 rounded-md ${isPrediction ? 'bg-indigo-50 border-l-4 border-indigo-300' : 'bg-gray-50'}`}
              >
                <div className={`text-xl ${isPrediction ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {isPrediction ? '🔮' : getActivityIcon(item.type)}
                </div>
                <div>
                  <p className={`font-medium ${isPrediction ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {activityTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 
                    <span className="ml-2">{isPrediction ? `[예측] ${item.type}` : item.type}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {detailText} {!isPrediction && (item as Activity).note && `(${(item as Activity).note})`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">기록된 활동이 없습니다.</p>
      )}
    </div>
  );
};

export default ActivityTimeline;
