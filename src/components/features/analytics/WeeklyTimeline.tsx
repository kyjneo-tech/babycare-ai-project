import { Activity } from "@prisma/client";

interface WeeklyTimelineProps {
  activities: Activity[];
  startDate: Date;
}

export function WeeklyTimeline({ activities, startDate }: WeeklyTimelineProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getPosition = (time: Date, baseDate: Date) => {
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const diff = time.getTime() - startOfDay.getTime();
    const totalDay = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.min(100, (diff / totalDay) * 100));
  };

  const getWidth = (start: Date, end: Date | null, baseDate: Date) => {
    if (!end) return 2;
    const startPos = getPosition(start, baseDate);
    const endPos = getPosition(end, baseDate);
    return Math.max(1, endPos - startPos);
  };

  const hours = Array.from({ length: 9 }, (_, i) => i * 3);

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[600px] p-4">
        {/* Time Grid Header */}
        <div className="relative h-6 mb-2 border-b border-gray-200 ml-14">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute bottom-0 text-xs text-gray-400 transform -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {days.map((day) => {
            const dayStart = new Date(day);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day);
            dayEnd.setHours(23, 59, 59, 999);

            const dayActivities = activities.filter(
              (a) =>
                new Date(a.startTime) >= dayStart &&
                new Date(a.startTime) <= dayEnd
            );

            const sleepActivities = dayActivities.filter((a) => a.type === "SLEEP");
            const feedingActivities = dayActivities.filter((a) => a.type === "FEEDING");

            return (
              <div key={day.toISOString()} className="flex items-center">
                {/* Date Label */}
                <div className="w-14 text-xs text-gray-500 font-medium text-right pr-2">
                  {day.toLocaleDateString("ko-KR", {
                    weekday: "short",
                    day: "numeric",
                  })}
                </div>

                {/* Timeline Bar */}
                <div className="relative flex-1 h-8 bg-gray-50 rounded-md border border-gray-100">
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

                  {/* Sleep Blocks */}
                  {sleepActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="absolute top-1 bottom-1 bg-indigo-300 rounded-sm opacity-80"
                      style={{
                        left: `${getPosition(new Date(activity.startTime), day)}%`,
                        width: `${getWidth(
                          new Date(activity.startTime),
                          activity.endTime ? new Date(activity.endTime) : null,
                          day
                        )}%`,
                      }}
                      title={`수면: ${new Date(activity.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`}
                    />
                  ))}

                  {/* Feeding Dots */}
                  {feedingActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"
                      style={{
                        left: `${getPosition(new Date(activity.startTime), day)}%`,
                      }}
                      title={`수유: ${new Date(activity.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-indigo-300 rounded-sm"></div>
                <span>수면</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>수유</span>
            </div>
        </div>
      </div>
    </div>
  );
}
