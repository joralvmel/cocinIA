/**
 * Base UI components
 * Reusable, atomic components like Button, Input, Card, etc.
 */

// Buttons
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { IconButton, type IconButtonProps, type IconButtonVariant, type IconButtonSize } from './IconButton';

// Inputs
export { Input, type InputProps } from './Input';
export { SearchInput, type SearchInputProps } from './SearchInput';
export { NumberInput, CompactNumberInput, type NumberInputProps, type CompactNumberInputProps } from './NumberInput';
export { Select, type SelectProps, type SelectOption } from './Select';

// Cards
export { Card, CardHeader, CardContent, CardFooter, type CardProps, type CardHeaderProps, type CardContentProps, type CardFooterProps } from './Card';
export { RecipeCard, type RecipeCardProps } from './RecipeCard';

// Feedback
export { Loader, FullScreenLoader, type LoaderProps, type LoaderSize, type LoaderVariant } from './Loader';
export { EmptyState, type EmptyStateProps, type EmptyStateVariant } from './EmptyState';

// Selection
export { Chip, ChipGroup, type ChipProps, type ChipGroupProps } from './Chip';
export { Checkbox, CheckboxItem, type CheckboxProps, type CheckboxItemProps } from './Checkbox';
export { Switch, SwitchItem, type SwitchProps, type SwitchItemProps } from './Switch';
export { SegmentControl, ToggleButtonGroup, DaySelector, type SegmentControlProps, type ToggleButtonGroupProps, type DaySelectorProps, type SegmentOption } from './SegmentControl';

// Display
export { Badge, InfoBadge, BadgeGroup, type BadgeProps, type BadgeVariant, type BadgeSize, type InfoBadgeProps, type BadgeGroupProps } from './Badge';
export { Avatar, AvatarGroup, type AvatarProps, type AvatarSize, type AvatarGroupProps } from './Avatar';
export { Divider, DividerWithText, type DividerProps, type DividerWithTextProps } from './Divider';
export { ProgressBar, StepperProgress, type ProgressBarProps, type StepperProgressProps } from './Progress';

// Layout
export { Section, SectionHeader, type SectionProps, type SectionHeaderProps } from './Section';
export { ListItem, ListItemSeparator, ListGroup, type ListItemProps, type ListGroupProps } from './ListItem';

// Modals
export { AlertModal, type AlertModalProps } from './AlertModal';
export { BottomSheet, type BottomSheetProps } from './BottomSheet';
export { FullScreenModal, type FullScreenModalProps } from './FullScreenModal';
