import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

export interface DatePickerProps {
  label?: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

const months = [
  { value: 1, label: 'January', labelEs: 'Enero' },
  { value: 2, label: 'February', labelEs: 'Febrero' },
  { value: 3, label: 'March', labelEs: 'Marzo' },
  { value: 4, label: 'April', labelEs: 'Abril' },
  { value: 5, label: 'May', labelEs: 'Mayo' },
  { value: 6, label: 'June', labelEs: 'Junio' },
  { value: 7, label: 'July', labelEs: 'Julio' },
  { value: 8, label: 'August', labelEs: 'Agosto' },
  { value: 9, label: 'September', labelEs: 'Septiembre' },
  { value: 10, label: 'October', labelEs: 'Octubre' },
  { value: 11, label: 'November', labelEs: 'Noviembre' },
  { value: 12, label: 'December', labelEs: 'Diciembre' },
];

export function DatePicker({
  label,
  value,
  onChange,
  placeholder,
  error,
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  className = '',
}: DatePickerProps) {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2000);

  // Parse current value
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDay(date.getDate());
        setSelectedMonth(date.getMonth() + 1);
        setSelectedYear(date.getFullYear());
      }
    }
  }, [value]);

  // Generate years array (descending)
  const years = useMemo(() => {
    const arr = [];
    for (let y = maxYear; y >= minYear; y--) {
      arr.push(y);
    }
    return arr;
  }, [minYear, maxYear]);

  // Generate days based on selected month/year
  const days = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  // Ensure selected day is valid for current month
  React.useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear]);

  const handleConfirm = () => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onChange(dateStr);
    setVisible(false);
  };

  const formatDisplayDate = () => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const isSpanish = i18n.language === 'es';
    const monthData = months[date.getMonth()];
    const monthLabel = isSpanish ? monthData.labelEs : monthData.label;
    return `${date.getDate()} ${monthLabel} ${date.getFullYear()}`;
  };

  const isSpanish = i18n.language === 'es';

  return (
    <View className={className}>
      {label && (
        <Text
          className={`font-medium mb-2 text-sm ${
            error ? 'text-red-500' : 'text-gray-900 dark:text-gray-50'
          }`}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setVisible(true)}
        className={`flex-row items-center justify-between rounded-xl px-4 py-3 border-[1.5px] ${
          error
            ? 'border-red-500'
            : 'border-gray-200 dark:border-gray-700'
        } bg-gray-50 dark:bg-gray-800`}
      >
        <Text
          className={`flex-1 ${
            value
              ? 'text-gray-900 dark:text-gray-50'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {formatDisplayDate() || placeholder || t('profile.birthDatePlaceholder')}
        </Text>
        <FontAwesome name="calendar" size={16} color="#9CA3AF" />
      </Pressable>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={t('profile.selectDate')}
      >
        <View className="flex-row gap-2 mb-4">
          {/* Day Selector */}
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
              {t('profile.day')}
            </Text>
            <ScrollView
              className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800"
              showsVerticalScrollIndicator={false}
            >
              {days.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  className={`py-2 px-3 mx-1 my-0.5 rounded-lg ${
                    selectedDay === day
                      ? 'bg-primary-500'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-center ${
                      selectedDay === day
                        ? 'text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Month Selector */}
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
              {t('profile.month')}
            </Text>
            <ScrollView
              className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800"
              showsVerticalScrollIndicator={false}
            >
              {months.map((month) => (
                <Pressable
                  key={month.value}
                  onPress={() => setSelectedMonth(month.value)}
                  className={`py-2 px-3 mx-1 my-0.5 rounded-lg ${
                    selectedMonth === month.value
                      ? 'bg-primary-500'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-center text-sm ${
                      selectedMonth === month.value
                        ? 'text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    numberOfLines={1}
                  >
                    {isSpanish ? month.labelEs.substring(0, 3) : month.label.substring(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Year Selector */}
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
              {t('profile.year')}
            </Text>
            <ScrollView
              className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800"
              showsVerticalScrollIndicator={false}
            >
              {years.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => setSelectedYear(year)}
                  className={`py-2 px-3 mx-1 my-0.5 rounded-lg ${
                    selectedYear === year
                      ? 'bg-primary-500'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-center ${
                      selectedYear === year
                        ? 'text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <Button onPress={handleConfirm} variant="primary" size="lg">
          {t('common.done')}
        </Button>
      </BottomSheet>
    </View>
  );
}
