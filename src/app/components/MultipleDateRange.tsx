// components/MultipleDateRange.tsx
import { useState, useEffect } from 'react';
import { formatDateSponsor } from '../utils/utils';
import { FiPlus, FiTrash, FiClock } from 'react-icons/fi';

interface DateRangeInputProps {
    beginDate: string | Date | (string | Date)[];
    endDate: string | Date | (string | Date)[];
    beginDateError?: string;
    endDateError?: string;
    onBeginDateChange: (date: string[]) => void;
    onEndDateChange: (date: string[]) => void;
    required?: boolean;
    disabled?: boolean;
    includeTime?: boolean;
}

interface DateTimeRange {
    beginDate: string;
    endDate: string;
    beginTime: string;
    endTime: string;
}

const MultipleDateRange = ({
    beginDate,
    endDate,
    beginDateError,
    endDateError,
    onBeginDateChange,
    onEndDateChange,
    required = false,
    disabled = false,
    includeTime = false
}: DateRangeInputProps) => {
    // Helper function to parse ISO datetime string
    const parseDateTime = (isoString: string | Date): { date: string, time: string } => {
        if (!isoString) return { date: '', time: '' };

        try {
            const dateObj = typeof isoString === 'string' ? new Date(isoString) : isoString;
            const dateStr = dateObj.toISOString().split('T')[0]; // Gets YYYY-MM-DD
            const timeStr = dateObj.toTimeString().split(' ')[0].substring(0, 5); // Gets HH:MM
            return { date: dateStr, time: timeStr };
        } catch (error) {
            return { date: '', time: '' };
        }
    };

    // Helper function to format single date for date input
    const formatSingleDate = (date: string | Date | undefined): string => {
        if (!date) return '';
        if (typeof date === 'string') {
            // If it's already an ISO string, extract just the date part
            if (date.includes('T')) {
                return date.split('T')[0];
            }
            return formatDateSponsor(date);
        }
        return formatDateSponsor(date.toString());
    };

    // Initialize date ranges from props
    const initializeDateRanges = (): DateTimeRange[] => {
        if (Array.isArray(beginDate) && Array.isArray(endDate)) {
            return beginDate.map((start, index) => {
                const startParsed = parseDateTime(start);
                const endParsed = parseDateTime(endDate[index] || '');

                return {
                    beginDate: startParsed.date,
                    endDate: endParsed.date,
                    beginTime: includeTime ? startParsed.time : '',
                    endTime: includeTime ? endParsed.time : ''
                };
            });
        } else {
            const startParsed = parseDateTime(beginDate as string | Date);
            const endParsed = parseDateTime(endDate as string | Date);

            return [{
                beginDate: startParsed.date,
                endDate: endParsed.date,
                beginTime: includeTime ? startParsed.time : '',
                endTime: includeTime ? endParsed.time : ''
            }];
        }
    };

    // Local state to manage date ranges
    const [dateRanges, setDateRanges] = useState<DateTimeRange[]>(() => {
        const initial = initializeDateRanges();
        return initial.length > 0 ? initial : [{
            beginDate: '',
            endDate: '',
            beginTime: '',
            endTime: ''
        }];
    });

    // Update local state when props change
    useEffect(() => {
        const newRanges = initializeDateRanges();
        if (newRanges.length > 0) {
            setDateRanges(newRanges);
        }
    }, [beginDate, endDate, includeTime]);

    const addDateRange = () => {
        const newRanges = [...dateRanges, { beginDate: '', endDate: '', beginTime: '', endTime: '' }];
        setDateRanges(newRanges);
        updateParent(newRanges);
    };

    const removeDateRange = (index: number) => {
        const newRanges = [...dateRanges];
        newRanges.splice(index, 1);
        setDateRanges(newRanges);
        updateParent(newRanges);
    };

    const handleDateChange = (index: number, field: keyof DateTimeRange, value: string) => {
        const newRanges = [...dateRanges];
        newRanges[index][field] = value;
        setDateRanges(newRanges);
        updateParent(newRanges);
    };

    const updateParent = (ranges: DateTimeRange[]) => {
        if (includeTime) {
            // Combine date and time into ISO format
            const combinedBeginDates = ranges.map(range => {
                if (range.beginDate && range.beginTime) {
                    return `${range.beginDate}T${range.beginTime}:00Z`;
                }
                return range.beginDate ? `${range.beginDate}T00:00:00Z` : '';
            });

            const combinedEndDates = ranges.map(range => {
                if (range.endDate && range.endTime) {
                    return `${range.endDate}T${range.endTime}:00Z`;
                }
                return range.endDate ? `${range.endDate}T00:00:00Z` : '';
            });

            onBeginDateChange(combinedBeginDates);
            onEndDateChange(combinedEndDates);
        } else {
            // For date-only, keep existing behavior
            onBeginDateChange(ranges.map(range =>
                range.beginDate ? `${range.beginDate}T00:00:00Z` : ''
            ));
            onEndDateChange(ranges.map(range =>
                range.endDate ? `${range.endDate}T00:00:00Z` : ''
            ));
        }
    };

    return (
        <div className="pb-6 border-b border-slate-700">
            {dateRanges.map((range, index) => (
                <div key={index} className="mb-4 p-4 bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-white">
                            {includeTime ? `Date & Time Range ${index + 1}` : `Date Range ${index + 1}`}
                        </h4>
                        {dateRanges.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeDateRange(index)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <FiTrash size={16} />
                            </button>
                        )}
                    </div>

                    <div className={`grid gap-6 ${includeTime ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {/* Start Date and Time */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor={`beginDate-${index}`}>
                                    Start Date {required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    className={`bg-slate-700 border ${beginDateError ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    id={`beginDate-${index}`}
                                    name={`beginDate-${index}`}
                                    type="date"
                                    value={range.beginDate}
                                    onChange={(e) => handleDateChange(index, 'beginDate', e.target.value)}
                                    disabled={disabled}
                                />
                                {index === 0 && beginDateError && (
                                    <p className="mt-2 text-sm text-red-500">{beginDateError}</p>
                                )}
                            </div>

                            {includeTime && (
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor={`beginTime-${index}`}>
                                        Start Time {required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        className={`bg-slate-700 border border-slate-600 text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        id={`beginTime-${index}`}
                                        name={`beginTime-${index}`}
                                        type="time"
                                        value={range.beginTime}
                                        onChange={(e) => handleDateChange(index, 'beginTime', e.target.value)}
                                        disabled={disabled}
                                    />
                                </div>
                            )}
                        </div>

                        {/* End Date and Time */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor={`endDate-${index}`}>
                                    End Date {required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    className={`bg-slate-700 border ${endDateError ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    id={`endDate-${index}`}
                                    name={`endDate-${index}`}
                                    type="date"
                                    value={range.endDate}
                                    onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
                                    disabled={disabled}
                                />
                                {index === 0 && endDateError && (
                                    <p className="mt-2 text-sm text-red-500">{endDateError}</p>
                                )}
                            </div>

                            {includeTime && (
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor={`endTime-${index}`}>
                                        End Time {required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        className={`bg-slate-700 border border-slate-600 text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        id={`endTime-${index}`}
                                        name={`endTime-${index}`}
                                        type="time"
                                        value={range.endTime}
                                        onChange={(e) => handleDateChange(index, 'endTime', e.target.value)}
                                        disabled={disabled}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <div className="mt-4">
                <button
                    type="button"
                    onClick={addDateRange}
                    className="px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors flex items-center"
                >
                    <FiPlus className="mr-2" />
                    Add {includeTime ? 'Date & Time Range' : 'Date Range'}
                </button>
            </div>
        </div>
    );
};

export default MultipleDateRange;