import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus,
  Video,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  X,
  Trash2
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  isBefore,
  isAfter
} from 'date-fns';
import ModernButton from './ModernButton';
import ModernCard from './ModernCard';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'appointment' | 'medication' | 'exercise' | 'follow-up' | 'therapy' | 'consultation';
  provider?: string;
  location?: string;
  isVirtual?: boolean;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  reminderSet?: boolean;
}

interface AppointmentForm {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: CalendarEvent['type'];
  provider: string;
  location: string;
  isVirtual: boolean;
  notes: string;
  priority: CalendarEvent['priority'];
}

interface EnhancedCalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (event: Omit<CalendarEvent, 'id' | 'status' | 'reminderSet'>) => void;
  onEventUpdate?: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onEventDelete?: (eventId: string) => void;
  selectedDate?: Date;
  canCreateEvents?: boolean;
  viewMode?: 'month' | 'week' | 'day';
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  events = [],
  onDateSelect,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  selectedDate,
  canCreateEvents = true,
  viewMode = 'month'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null);
  const [eventForm, setEventForm] = useState<AppointmentForm>({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'appointment',
    provider: '',
    location: '',
    isVirtual: false,
    notes: '',
    priority: 'medium'
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventTypeColor = (type: string, status: string = 'scheduled') => {
    const baseColors = {
      appointment: 'bg-blue-500',
      medication: 'bg-green-500',
      exercise: 'bg-purple-500',
      'follow-up': 'bg-orange-500',
      therapy: 'bg-pink-500',
      consultation: 'bg-indigo-500'
    };

    const statusModifiers = {
      completed: 'opacity-60',
      cancelled: 'opacity-40 line-through',
      rescheduled: 'opacity-70'
    };

    return `${baseColors[type as keyof typeof baseColors] || 'bg-gray-500'} ${statusModifiers[status as keyof typeof statusModifiers] || ''}`;
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
    if (canCreateEvents) {
      setSelectedDateForEvent(date);
      setEventForm(prev => ({ ...prev, date }));
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      provider: event.provider || '',
      location: event.location || '',
      isVirtual: event.isVirtual || false,
      notes: event.notes || '',
      priority: event.priority
    });
    setShowEventForm(true);
  };

  const handleCreateEvent = () => {
    setShowEventForm(true);
    setEditingEvent(null);
    setEventForm({
      title: '',
      date: selectedDateForEvent || new Date(),
      startTime: '09:00',
      endTime: '10:00',
      type: 'appointment',
      provider: '',
      location: '',
      isVirtual: false,
      notes: '',
      priority: 'medium'
    });
  };

  const handleSaveEvent = () => {
    const eventData = {
      ...eventForm,
      status: editingEvent?.status || 'scheduled' as const,
      reminderSet: editingEvent?.reminderSet || false
    };

    if (editingEvent) {
      onEventUpdate?.(editingEvent.id, eventData);
    } else {
      onEventCreate?.(eventData);
    }

    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      onEventDelete?.(editingEvent.id);
      setShowEventForm(false);
      setEditingEvent(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'cancelled': return <X className="w-3 h-3 text-red-600" />;
      case 'confirmed': return <CheckCircle className="w-3 h-3 text-blue-600" />;
      default: return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Days of Week Header */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
          {day}
        </div>
      ))}

      {/* Calendar Days */}
      {calendarDays.map((day, index) => {
        const dayEvents = getEventsForDate(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isDayToday = isToday(day);
        const isPast = isBefore(day, new Date()) && !isDayToday;

        return (
          <motion.div
            key={day.toISOString()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`
              relative p-2 min-h-[120px] border border-gray-200 cursor-pointer
              hover:bg-blue-50 transition-all duration-200 rounded-lg
              ${isSelected ? 'bg-blue-100 border-blue-300 shadow-md' : ''}
              ${isDayToday ? 'bg-green-50 border-green-300' : ''}
              ${!isCurrentMonth ? 'opacity-40' : ''}
              ${isPast ? 'bg-gray-50' : ''}
            `}
            onClick={() => handleDateClick(day)}
          >
            {/* Date Number */}
            <div className={`
              text-sm font-semibold mb-1 flex items-center justify-between
              ${isDayToday ? 'text-green-700' : 'text-gray-900'}
              ${isSelected ? 'text-blue-700' : ''}
              ${isPast ? 'text-gray-500' : ''}
            `}>
              <span>{format(day, 'd')}</span>
              {isDayToday && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            
            {/* Events */}
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    text-xs px-2 py-1 rounded-md text-white cursor-pointer
                    flex items-center space-x-1 ${getPriorityIndicator(event.priority)}
                    ${getEventTypeColor(event.type, event.status)}
                  `}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  {getStatusIcon(event.status)}
                  <span className="truncate flex-1">
                    {event.title.length > 12 ? `${event.title.slice(0, 12)}...` : event.title}
                  </span>
                  {event.isVirtual && <Video className="w-3 h-3" />}
                </motion.div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>

            {/* Add Event Button */}
            {canCreateEvents && isCurrentMonth && !isPast && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDateForEvent(day);
                  handleCreateEvent();
                }}
                className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <CalendarIcon className="w-7 h-7 text-blue-600" />
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

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentViewMode(mode as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentViewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {canCreateEvents && (
            <ModernButton
              onClick={handleCreateEvent}
              variant="primary"
              size="sm"
              icon={Plus}
              voiceCommand="create appointment"
            >
              New Event
            </ModernButton>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <ModernCard className="overflow-hidden">
        {currentViewMode === 'month' && renderMonthView()}
      </ModernCard>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {events.filter(e => e.status === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </ModernCard>
        
        <ModernCard className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {events.filter(e => e.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </ModernCard>
        
        <ModernCard className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {events.filter(e => e.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </ModernCard>
        
        <ModernCard className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {events.filter(e => e.isVirtual).length}
          </div>
          <div className="text-sm text-gray-600">Virtual</div>
        </ModernCard>
      </div>

      {/* Legend */}
      <ModernCard>
        <h3 className="font-semibold text-gray-900 mb-3">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { type: 'appointment', label: 'Appointments', icon: User },
            { type: 'medication', label: 'Medications', icon: Clock },
            { type: 'exercise', label: 'Exercises', icon: CalendarIcon },
            { type: 'follow-up', label: 'Follow-ups', icon: CalendarIcon },
            { type: 'therapy', label: 'Therapy', icon: User },
            { type: 'consultation', label: 'Consultations', icon: Video }
          ].map(({ type, label, icon: Icon }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${getEventTypeColor(type)}`} />
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </ModernCard>

      {/* Event Form Modal */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter event title"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={format(eventForm.date, 'yyyy-MM-dd')}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: new Date(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Event Type and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                      </label>
                      <select
                        value={eventForm.type}
                        onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="appointment">Appointment</option>
                        <option value="medication">Medication</option>
                        <option value="exercise">Exercise</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="therapy">Therapy</option>
                        <option value="consultation">Consultation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={eventForm.priority}
                        onChange={(e) => setEventForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Provider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Healthcare Provider
                    </label>
                    <input
                      type="text"
                      value={eventForm.provider}
                      onChange={(e) => setEventForm(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dr. Smith, Physical Therapist, etc."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isVirtual"
                          checked={eventForm.isVirtual}
                          onChange={(e) => setEventForm(prev => ({ ...prev, isVirtual: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isVirtual" className="text-sm text-gray-700">
                          Virtual appointment
                        </label>
                      </div>
                      {!eventForm.isVirtual && (
                        <input
                          type="text"
                          value={eventForm.location}
                          onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Hospital, clinic address, etc."
                        />
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={eventForm.notes}
                      onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes or instructions"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  {editingEvent && (
                    <ModernButton
                      onClick={handleDeleteEvent}
                      variant="danger"
                      size="sm"
                    >
                      Delete Event
                    </ModernButton>
                  )}
                  
                  <div className="flex items-center space-x-3 ml-auto">
                    <ModernButton
                      onClick={() => setShowEventForm(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </ModernButton>
                    <ModernButton
                      onClick={handleSaveEvent}
                      variant="primary"
                      size="sm"
                      disabled={!eventForm.title.trim()}
                    >
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </ModernButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedCalendar;