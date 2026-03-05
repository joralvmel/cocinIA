import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getRestrictionById } from '@/constants';
import type { ProfileRestriction } from '@/services';

interface RestrictionsBannerProps {
  restrictions: ProfileRestriction[];
}

export function RestrictionsBanner({ restrictions }: RestrictionsBannerProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (restrictions.length === 0) return null;

  return (
    <View className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
      <View className="flex-row items-center mb-2">
        <FontAwesome
          name="shield"
          size={14}
          color={(colors as any).warning || '#f59e0b'}
          style={{ marginRight: 6 }}
        />
        <Text className="text-sm font-medium text-amber-700 dark:text-amber-300">
          {t('recipeGeneration.activeRestrictions' as any)}
        </Text>
      </View>
      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
        {restrictions.map((r) => {
          let displayText: string;
          if (r.custom_value) {
            displayText = r.custom_value;
          } else {
            const restrictionDef = getRestrictionById(r.restriction_type);
            displayText = restrictionDef
              ? String(t(restrictionDef.labelKey as any, { defaultValue: restrictionDef.defaultLabel }))
              : r.restriction_type;
          }
          return (
            <View
              key={r.id}
              className={`px-2.5 py-1 rounded-full ${
                r.is_allergy
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : 'bg-amber-100 dark:bg-amber-900/40'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  r.is_allergy
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {r.is_allergy ? '⚠️ ' : '🥗 '}
                {displayText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

