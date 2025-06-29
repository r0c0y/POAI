import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'appointment' | 'medication' | 'exercise' | 'follow-up';
  provider?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  selectedDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDateSelect,
  onEventClick,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'medication': return 'bg-green-500';
      case 'exercise': return 'bg-purple-500';
      case 'follow-up': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                relative p-2 min-h-[80px] border border-gray-100 cursor-pointer
                hover:bg-blue-50 transition-colors rounded-lg
                ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                ${isToday ? 'bg-green-50 border-green-300' : ''}
                ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}
              `}
              onClick={() => onDateSelect?.(day)}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isToday ? 'text-green-700' : 'text-gray-900'}
                ${isSelected ? 'text-blue-700' : ''}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.05 }}
                    className={`
                      text-xs px-1 py-0.5 rounded text-white cursor-pointer
                      ${getEventTypeColor(event.type)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                  </motion.div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { type: 'appointment', label: 'Appointments', icon: User },
            { type: 'medication', label: 'Medications', icon: Clock },
            { type: 'exercise', label: 'Exercises', icon: CalendarIcon },
            { type: 'follow-up', label: 'Follow-ups', icon: CalendarIcon }
          ].map(({ type, label, icon: Icon }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${getEventTypeColor(type)}`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;