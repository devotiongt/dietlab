import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function WeekSelectorCalendar({ selectedWeeks = [], onWeeksChange, errors }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // If we have selectedWeeks, initialize to the month of the first selected week
    if (selectedWeeks.length > 0) {
      const firstWeekTimestamp = parseInt(selectedWeeks[0]);
      return new Date(firstWeekTimestamp);
    }
    return new Date();
  });
  const [hoveredWeek, setHoveredWeek] = useState(null);

  // Update currentMonth when selectedWeeks changes (for editing mode)
  useEffect(() => {
    if (selectedWeeks.length > 0) {
      const firstWeekTimestamp = parseInt(selectedWeeks[0]);
      const firstWeekDate = new Date(firstWeekTimestamp);
      setCurrentMonth(firstWeekDate);
    }
  }, [selectedWeeks]);

  // Calcular el primer lunes del mes y las semanas visibles
  const getWeeksInView = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Encontrar el primer lunes visible (puede ser del mes anterior)
    const firstMondayOfView = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0=Sunday, 1=Monday
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstMondayOfView.setDate(firstDayOfMonth.getDate() - daysToSubtract);

    // Generar semanas (6 semanas para cubrir todo el mes)
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(firstMondayOfView);
      weekStart.setDate(firstMondayOfView.getDate() + (i * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Solo incluir semanas que tengan al menos un día del mes actual o siguiente
      if (weekEnd >= firstDayOfMonth && weekStart <= lastDayOfMonth) {
        weeks.push({
          id: `${weekStart.getTime()}`,
          start: new Date(weekStart),
          end: new Date(weekEnd),
          days: Array.from({length: 7}, (_, dayIndex) => {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + dayIndex);
            return day;
          })
        });
      }
    }

    return weeks;
  };

  const weeks = getWeeksInView(currentMonth);

  const isWeekSelected = (weekId) => {
    return selectedWeeks.includes(weekId);
  };

  const isWeekSelectable = (weekId) => {
    if (selectedWeeks.length === 0) return true;

    // Si ya está seleccionada, siempre es "seleccionable" (para deseleccionar)
    if (isWeekSelected(weekId)) return true;

    // Verificar si agregando esta semana mantiene consecutividad
    const testWeeks = [...selectedWeeks, weekId].sort((a, b) => parseInt(a) - parseInt(b));

    for (let i = 1; i < testWeeks.length; i++) {
      const prevWeek = parseInt(testWeeks[i - 1]);
      const currentWeek = parseInt(testWeeks[i]);
      const weekDiff = (currentWeek - prevWeek) / (7 * 24 * 60 * 60 * 1000);

      if (Math.abs(weekDiff - 1) > 0.1) {
        return false;
      }
    }

    return true;
  };

  const toggleWeek = (week) => {
    let newSelectedWeeks = [...selectedWeeks];

    if (isWeekSelected(week.id)) {
      // Al deseleccionar, verificar si mantiene consecutividad
      const filtered = newSelectedWeeks.filter(id => id !== week.id);

      if (filtered.length === 0) {
        newSelectedWeeks = [];
      } else {
        // Verificar si las semanas restantes siguen siendo consecutivas
        const sorted = filtered.sort((a, b) => parseInt(a) - parseInt(b));
        let areConsecutive = true;

        for (let i = 1; i < sorted.length; i++) {
          const prevWeek = parseInt(sorted[i - 1]);
          const currentWeek = parseInt(sorted[i]);
          const weekDiff = (currentWeek - prevWeek) / (7 * 24 * 60 * 60 * 1000);

          if (Math.abs(weekDiff - 1) > 0.1) { // Tolerancia para diferencias de tiempo
            areConsecutive = false;
            break;
          }
        }

        if (areConsecutive) {
          newSelectedWeeks = filtered;
        } else {
          // Si al quitar la semana se rompe la consecutividad, limpiar todo
          newSelectedWeeks = [];
        }
      }
    } else {
      // Al seleccionar una nueva semana
      if (newSelectedWeeks.length === 0) {
        // Primera semana seleccionada
        newSelectedWeeks = [week.id];
      } else {
        // Verificar si la nueva semana mantiene la consecutividad
        const testWeeks = [...newSelectedWeeks, week.id].sort((a, b) => parseInt(a) - parseInt(b));
        let areConsecutive = true;

        for (let i = 1; i < testWeeks.length; i++) {
          const prevWeek = parseInt(testWeeks[i - 1]);
          const currentWeek = parseInt(testWeeks[i]);
          const weekDiff = (currentWeek - prevWeek) / (7 * 24 * 60 * 60 * 1000);

          if (Math.abs(weekDiff - 1) > 0.1) { // Tolerancia para diferencias de tiempo
            areConsecutive = false;
            break;
          }
        }

        if (areConsecutive) {
          newSelectedWeeks = testWeeks;
        } else {
          // Si no es consecutiva, empezar nueva selección desde esta semana
          newSelectedWeeks = [week.id];
        }
      }
    }

    // Ordenar semanas por fecha
    newSelectedWeeks.sort((a, b) => parseInt(a) - parseInt(b));

    // Calcular fechas de inicio y fin del plan
    if (newSelectedWeeks.length > 0) {
      const firstWeek = weeks.find(w => w.id === newSelectedWeeks[0]);
      const lastWeek = weeks.find(w => w.id === newSelectedWeeks[newSelectedWeeks.length - 1]);

      // Si no encontramos las semanas en el mes actual, buscar en otros meses
      let startDate = firstWeek?.start;
      let endDate = lastWeek?.end;

      if (!startDate || !endDate) {
        // Recalcular desde los timestamps
        const firstTimestamp = parseInt(newSelectedWeeks[0]);
        const lastTimestamp = parseInt(newSelectedWeeks[newSelectedWeeks.length - 1]);

        startDate = new Date(firstTimestamp);
        endDate = new Date(lastTimestamp);
        endDate.setDate(endDate.getDate() + 6); // Domingo de esa semana
      }

      onWeeksChange(newSelectedWeeks, startDate, endDate, newSelectedWeeks.length);
    } else {
      onWeeksChange([], null, null, 0);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getWeekSummary = () => {
    if (selectedWeeks.length === 0) return null;

    const sortedWeeks = [...selectedWeeks].sort((a, b) => parseInt(a) - parseInt(b));
    const firstDate = new Date(parseInt(sortedWeeks[0]));
    const lastDate = new Date(parseInt(sortedWeeks[sortedWeeks.length - 1]));
    lastDate.setDate(lastDate.getDate() + 6);

    return {
      start: firstDate,
      end: lastDate,
      count: selectedWeeks.length,
      days: selectedWeeks.length * 7
    };
  };

  const summary = getWeekSummary();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Selecciona las semanas del plan</h4>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">
            {formatMonthYear(currentMonth)}
          </span>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Instrucciones:</p>
            <p className="text-blue-700">
              Haz clic en las semanas que quieres incluir en el plan. Las semanas van de lunes a domingo y
              <span className="font-medium"> deben ser consecutivas</span>. Si seleccionas una semana no consecutiva,
              se iniciará una nueva selección desde esa semana.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border rounded-lg p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="space-y-1">
          {weeks.map((week) => {
            const isSelected = isWeekSelected(week.id);
            const isSelectable = isWeekSelectable(week.id);
            const isHovered = hoveredWeek === week.id;

            return (
              <div
                key={week.id}
                className={`
                  grid grid-cols-7 gap-1 p-1 rounded-lg transition-all duration-150
                  ${isSelected
                    ? 'bg-blue-100 ring-2 ring-blue-500 shadow-sm cursor-pointer'
                    : isSelectable
                      ? isHovered
                        ? 'bg-gray-50 ring-1 ring-gray-300 cursor-pointer'
                        : 'hover:bg-gray-50 cursor-pointer'
                      : 'bg-gray-100 opacity-50 cursor-not-allowed'
                  }
                `}
                onClick={() => isSelectable && toggleWeek(week)}
                onMouseEnter={() => isSelectable && setHoveredWeek(week.id)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                {week.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      text-center p-2 text-sm rounded transition-colors
                      ${isCurrentMonth(day)
                        ? isSelected
                          ? 'text-blue-900 font-medium'
                          : isSelectable
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        : isSelectable
                          ? 'text-gray-400'
                          : 'text-gray-300'
                      }
                      ${isToday(day) ? 'bg-yellow-100 font-bold' : ''}
                      ${dayIndex === 0 || dayIndex === 6 ? 'font-medium' : ''}
                    `}
                  >
                    {day.getDate()}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-green-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-green-900 mb-2">Plan seleccionado:</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-green-700 font-medium">Duración</p>
              <p className="text-green-800">
                {summary.count} {summary.count === 1 ? 'semana' : 'semanas'} ({summary.days} días)
              </p>
            </div>
            <div>
              <p className="text-green-700 font-medium">Fecha de inicio</p>
              <p className="text-green-800">
                {summary.start.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-green-700 font-medium">Fecha de fin</p>
              <p className="text-green-800">
                {summary.end.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.weeks_duration && (
        <p className="text-red-500 text-sm">{errors.weeks_duration}</p>
      )}
      {errors.start_date && (
        <p className="text-red-500 text-sm">{errors.start_date}</p>
      )}
    </div>
  );
}