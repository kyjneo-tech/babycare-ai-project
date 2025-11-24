import { Activity } from "@prisma/client";

interface DailyTimelineProps {
  activities: Activity[];
  date: Date;
}

export function DailyTimeline({ activities, date }: DailyTimelineProps) {
  // 0시부터 24시까지의 타임라인
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const getPosition = (time: Date) => {
    const diff = time.getTime() - startOfDay.getTime();
    const totalDay = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.min(100, (diff / totalDay) * 100));
  };

  const getWidth = (start: Date, end: Date | null) => {
    if (!end) return 2; // 종료 시간 없으면 기본 너비
    const startPos = getPosition(start);
    const endPos = getPosition(end);
    return Math.max(1, endPos - startPos); // 최소 1% 너비
  };

  const sleepActivities = activities.filter((a) => a.type === "SLEEP");
  const feedingActivities = activities.filter((a) => a.type === "FEEDING");
  const diaperActivities = activities.filter((a) => a.type === "DIAPER");
  const otherActivities = activities.filter(
    (a) => !["SLEEP", "FEEDING", "DIAPER"].includes(a.type)
  );

  const hours = Array.from({ length: 9 }, (_, i) => i * 3); // 0, 3, 6, ... 24

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[600px] p-4">
        {/* Time Grid */}
        <div className="relative h-8 mb-2 border-b border-gray-200">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute bottom-0 text-xs text-gray-400 transform -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Lanes */}
        <div className="space-y-6 relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-l border-gray-100"
                style={{ left: `${(h / 24) * 100}%` }}
              />
            ))}
          </div>

          {/* Sleep Lane */}
          <div className="relative h-12 bg-indigo-50/50 rounded-lg flex items-center px-2">
            <span className="absolute -left-16 text-sm font-semibold text-indigo-800 w-14 text-right">
              수면
            </span>
            <div className="relative w-full h-8">
              {sleepActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="absolute top-0 bottom-0 bg-indigo-400 rounded-md opacity-80 hover:opacity-100 transition-opacity cursor-pointer group"
                  style={{
                    left: `${getPosition(new Date(activity.startTime))}%`,
                    width: `${getWidth(
                      new Date(activity.startTime),
                      activity.endTime ? new Date(activity.endTime) : null
                    )}%`,
                  }}
                >
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                    {new Date(activity.startTime).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" ~ "}
                    {activity.endTime
                      ? new Date(activity.endTime).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "진행 중"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feeding Lane */}
          <div className="relative h-12 bg-blue-50/50 rounded-lg flex items-center px-2">
            <span className="absolute -left-16 text-sm font-semibold text-blue-800 w-14 text-right">
              수유
            </span>
            <div className="relative w-full h-8">
              {feedingActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xl cursor-pointer group"
                  style={{
                    left: `${getPosition(new Date(activity.startTime))}%`,
                  }}
                >
                  🍼
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                    {new Date(activity.startTime).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <br />
                    {activity.feedingType === "breast"
                      ? `모유 ${activity.duration || 0}분`
                      : `${activity.feedingAmount || 0}ml`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diaper Lane */}
          <div className="relative h-12 bg-yellow-50/50 rounded-lg flex items-center px-2">
            <span className="absolute -left-16 text-sm font-semibold text-yellow-800 w-14 text-right">
              배변
            </span>
            <div className="relative w-full h-8">
              {diaperActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xl cursor-pointer group"
                  style={{
                    left: `${getPosition(new Date(activity.startTime))}%`,
                  }}
                >
                  💩
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                    {new Date(activity.startTime).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <br />
                    {activity.diaperType === "urine"
                      ? "소변"
                      : activity.diaperType === "stool"
                      ? "대변"
                      : "소변+대변"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
           {/* Other Lane (Medicine, Temp, etc.) */}
           {otherActivities.length > 0 && (
            <div className="relative h-12 bg-gray-50/50 rounded-lg flex items-center px-2">
              <span className="absolute -left-16 text-sm font-semibold text-gray-800 w-14 text-right">
                기타
              </span>
              <div className="relative w-full h-8">
                {otherActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xl cursor-pointer group"
                    style={{
                      left: `${getPosition(new Date(activity.startTime))}%`,
                    }}
                  >
                    {activity.type === "MEDICINE" ? "💊" : activity.type === "TEMPERATURE" ? "🌡️" : "📝"}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                      {new Date(activity.startTime).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <br />
                      {activity.type === "MEDICINE" ? activity.medicineName : activity.type === "TEMPERATURE" ? `${activity.temperature}°C` : activity.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
