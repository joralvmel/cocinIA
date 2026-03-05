import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Section, Divider, Badge } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Chef Tips                                                          */
/* ------------------------------------------------------------------ */

interface ChefTipsProps {
  tips: string[];
}

export function ChefTips({ tips }: ChefTipsProps) {
  const { t } = useTranslation();
  if (tips.length === 0) return null;

  return (
    <>
      <Divider className="my-4" />
      <Section title={`💡 ${t('recipeGeneration.chefTips')}`}>
        <Card variant="default" className="bg-amber-50 dark:bg-amber-900/20">
          {tips.map((tip, index) => (
            <View key={index} className="flex-row py-2">
              <Text className="text-amber-600 dark:text-amber-400 mr-2">•</Text>
              <Text className="flex-1 text-amber-800 dark:text-amber-200">{tip}</Text>
            </View>
          ))}
        </Card>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Storage Instructions                                               */
/* ------------------------------------------------------------------ */

interface StorageCardProps {
  instructions: string;
}

export function StorageCard({ instructions }: StorageCardProps) {
  const { t } = useTranslation();

  return (
    <>
      <Divider className="my-4" />
      <Section title={`📦 ${t('recipeGeneration.storage')}`}>
        <Card variant="outlined">
          <Text className="text-gray-700 dark:text-gray-300">{instructions}</Text>
        </Card>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Variations                                                         */
/* ------------------------------------------------------------------ */

interface VariationsCardProps {
  variations: string[];
}

export function VariationsCard({ variations }: VariationsCardProps) {
  const { t } = useTranslation();
  if (variations.length === 0) return null;

  return (
    <>
      <Divider className="my-4" />
      <Section title={`🔄 ${t('recipeGeneration.variations')}`}>
        <Card variant="outlined">
          {variations.map((variation, index) => (
            <View key={index} className="flex-row py-2">
              <Text className="text-primary-600 dark:text-primary-400 mr-2">•</Text>
              <Text className="flex-1 text-gray-700 dark:text-gray-300">{variation}</Text>
            </View>
          ))}
        </Card>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tags                                                               */
/* ------------------------------------------------------------------ */

interface TagsRowProps {
  tags: string[];
}

export function TagsRow({ tags }: TagsRowProps) {
  if (tags.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2 mt-4">
      {tags.map((tag, index) => (
        <Badge key={index} variant="default" label={`#${tag}`} size="sm" />
      ))}
    </View>
  );
}

