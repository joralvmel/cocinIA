import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  Button,
  IconButton,
  Input,
  SearchInput,
  NumberInput,
  CompactNumberInput,
  Select,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  RecipeCard,
  Loader,
  EmptyState,
  Chip,
  ChipGroup,
  Checkbox,
  CheckboxItem,
  Switch,
  SwitchItem,
  SegmentControl,
  ToggleButtonGroup,
  DaySelector,
  Badge,
  BadgeGroup,
  Avatar,
  AvatarGroup,
  Divider,
  DividerWithText,
  ProgressBar,
  StepperProgress,
  Section,
  ListItem,
  ListGroup,
  AlertModal,
  BottomSheet,
  FullScreenModal,
} from '@/components/ui';

export default function ComponentsDemoScreen() {
  const { colors } = useAppTheme();

  // State for interactive demos
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [numberValue, setNumberValue] = useState(4);
  const [selectValue, setSelectValue] = useState<string[]>([]);
  const [difficultyValue, setDifficultyValue] = useState<string[]>([]);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [shoppingItem1, setShoppingItem1] = useState(false);
  const [shoppingItem2, setShoppingItem2] = useState(true);
  const [switchValue, setSwitchValue] = useState(false);
  const [batchCooking, setBatchCooking] = useState(true);
  const [selectedChips, setSelectedChips] = useState<string[]>(['quick']);
  const [segmentValue, setSegmentValue] = useState('all');
  const [toggleValues, setToggleValues] = useState<string[]>(['breakfast']);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [favoriteRecipe, setFavoriteRecipe] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const difficultyOptions = [
    { id: 'easy', label: 'Easy', icon: 'smile-o' as const },
    { id: 'medium', label: 'Medium', icon: 'meh-o' as const },
    { id: 'hard', label: 'Hard', icon: 'fire' as const },
  ];

  const chipOptions = [
    { id: 'quick', label: 'Quick', icon: 'clock-o' as const },
    { id: 'healthy', label: 'Healthy', icon: 'heart' as const },
    { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' as const },
    { id: 'budget', label: 'Budget', icon: 'money' as const },
  ];

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: 'coffee' as const },
    { value: 'lunch', label: 'Lunch', icon: 'cutlery' as const },
    { value: 'dinner', label: 'Dinner', icon: 'moon-o' as const },
    { value: 'snack', label: 'Snack', icon: 'apple' as const },
  ];

  const cuisineOptions = [
    { value: 'italian', label: 'Italian', icon: 'cutlery' as const },
    { value: 'mexican', label: 'Mexican', icon: 'fire' as const },
    { value: 'asian', label: 'Asian', icon: 'leaf' as const },
    { value: 'american', label: 'American', icon: 'star' as const },
  ];

  const handleLoadingDemo = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          🎨 UI Components Demo
        </Text>
        <Text className="text-sm mb-6" style={{ color: colors.textSecondary }}>
          Interactive showcase of all available components
        </Text>

        {/* BUTTONS SECTION */}
        <Section title="Buttons" subtitle="Different variants and sizes">
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              <Button variant="primary" icon="magic">Generate</Button>
              <Button variant="secondary" icon="save">Save</Button>
              <Button variant="outline" icon="edit">Edit</Button>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" icon="trash">Delete</Button>
              <Button disabled>Disabled</Button>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </View>
            <Button loading={buttonLoading} onPress={handleLoadingDemo} fullWidth>
              {buttonLoading ? 'Loading...' : 'Press for loading state'}
            </Button>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* ICON BUTTONS */}
        <Section title="Icon Buttons" subtitle="Buttons with icons only">
          <View className="flex-row items-center gap-3 mb-4">
            <IconButton icon="heart" variant="primary" />
            <IconButton icon="share" variant="secondary" />
            <IconButton icon="bookmark" variant="outline" />
            <IconButton icon="ellipsis-h" variant="ghost" />
          </View>
          <View className="flex-row items-center gap-3 mb-4">
            <IconButton icon="plus" size="sm" variant="primary" />
            <IconButton icon="plus" size="md" variant="primary" />
            <IconButton icon="plus" size="lg" variant="primary" />
            <IconButton icon="plus" size="xl" variant="primary" />
          </View>
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">
            Use xl size with shadow for FAB-style button:
          </Text>
          <View className="flex-row gap-3">
            <View style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, borderRadius: 28 }}>
              <IconButton icon="plus" size="xl" variant="primary" />
            </View>
            <View style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, borderRadius: 28 }}>
              <IconButton icon="magic" size="xl" variant="primary" />
            </View>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* INPUTS */}
        <Section title="Inputs" subtitle="Text input fields">
          <View className="gap-4">
            <Input
              label="Recipe Name"
              placeholder="E.g: Pasta Carbonara"
              value={inputValue}
              onChangeText={setInputValue}
              leftIcon="cutlery"
            />
            <Input
              label="Password"
              placeholder="Your password"
              secureTextEntry
              leftIcon="lock"
            />
            <Input
              label="Special Notes"
              placeholder="Additional instructions for the AI..."
              multiline
              numberOfLines={3}
            />
            <Input
              label="With Error"
              placeholder="Field with error"
              value="invalid text"
              error="This field has an error"
            />
            <Input
              label="Disabled"
              placeholder="Not editable"
              disabled
              value="Fixed value"
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* SEARCH INPUT */}
        <Section title="Search Input" subtitle="Search bar with filters">
          <SearchInput
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search recipes..."
            showFilter
            onFilterPress={() => setBottomSheetVisible(true)}
          />
        </Section>

        <Divider className="my-4" />

        {/* NUMBER INPUTS */}
        <Section title="Number Inputs" subtitle="Numeric selectors (tap to type)">
          <View className="gap-4">
            <NumberInput
              label="Number of servings"
              value={numberValue}
              onChange={setNumberValue}
              min={1}
              max={12}
            />
            <View className="flex-row items-center justify-between">
              <Text style={{ color: colors.text }}>Quantity:</Text>
              <CompactNumberInput
                value={numberValue}
                onChange={setNumberValue}
                min={1}
                max={20}
              />
            </View>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* SELECT */}
        <Section title="Select" subtitle="Dropdown selectors">
          <View className="gap-4">
            <Select
              label="Cuisine (multiple)"
              options={cuisineOptions}
              value={selectValue}
              onChange={(v) => setSelectValue(v as string[])}
              placeholder="Select cuisines"
              multiple
            />
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              For single selection like difficulty, use ChipGroup instead:
            </Text>
            <Text style={{ color: colors.text }} className="font-medium">
              Difficulty
            </Text>
            <ChipGroup
              chips={difficultyOptions}
              selectedIds={difficultyValue}
              onSelectionChange={setDifficultyValue}
              multiple={false}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* CHIPS */}
        <Section title="Chips" subtitle="Selectable tags">
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-2">
              <Chip label="Normal" />
              <Chip label="Selected" selected />
              <Chip label="With Icon" icon="star" />
              <Chip label="Removable" onRemove={() => {}} />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              ChipGroup (multiple selection):
            </Text>
            <ChipGroup
              chips={chipOptions}
              selectedIds={selectedChips}
              onSelectionChange={setSelectedChips}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* CHECKBOXES */}
        <Section title="Checkboxes" subtitle="For shopping lists and selection">
          <View className="gap-3">
            <Checkbox
              checked={checkboxValue}
              onChange={setCheckboxValue}
              label="I accept the terms and conditions"
              description="Read our privacy policy"
            />
            <Card variant="outlined" padding="none">
              <CheckboxItem
                checked={shoppingItem1}
                onChange={setShoppingItem1}
                label="Tomatoes (500g)"
                right={<Text style={{ color: colors.textSecondary }}>$2.50</Text>}
              />
              <View className="h-px" style={{ backgroundColor: colors.border }} />
              <CheckboxItem
                checked={shoppingItem2}
                onChange={setShoppingItem2}
                label="Onion (2 units)"
                right={<Text style={{ color: colors.textSecondary }}>$1.20</Text>}
              />
            </Card>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* SWITCHES */}
        <Section title="Switches" subtitle="Toggle on/off with animation">
          <View className="gap-3">
            <Switch
              value={switchValue}
              onValueChange={setSwitchValue}
              label="Notifications"
              description="Receive alerts about new recipes"
            />
            <Card variant="outlined" padding="none">
              <SwitchItem
                icon="calendar"
                value={batchCooking}
                onValueChange={setBatchCooking}
                label="Batch Cooking Mode"
                description="Prepare multiple meals at once"
              />
            </Card>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* SEGMENT CONTROLS */}
        <Section title="Segment Controls" subtitle="Option selectors">
          <View className="gap-4">
            <SegmentControl
              options={[
                { value: 'all', label: 'All' },
                { value: 'favorites', label: 'Favorites' },
                { value: 'recent', label: 'Recent' },
              ]}
              value={segmentValue}
              onChange={setSegmentValue}
            />
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Toggle Button Group:
            </Text>
            <ToggleButtonGroup
              options={mealOptions}
              values={toggleValues}
              onChange={setToggleValues}
            />
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Day Selector:
            </Text>
            <DaySelector
              selectedDays={selectedDays}
              onChange={setSelectedDays}
              labels={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* BADGES */}
        <Section title="Badges" subtitle="Information labels">
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-2">
              <Badge label="Default" />
              <Badge label="Primary" variant="primary" />
              <Badge label="Success" variant="success" icon="check" />
              <Badge label="Warning" variant="warning" />
              <Badge label="Error" variant="error" />
              <Badge label="Info" variant="info" />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Info Badges (for recipes):
            </Text>
            <BadgeGroup
              badges={[
                { icon: 'clock-o', value: '30 min', label: 'Time' },
                { icon: 'users', value: '4', label: 'Servings' },
                { icon: 'fire', value: '450', label: 'Calories' },
                { icon: 'signal', value: 'Medium', label: 'Difficulty' },
              ]}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* AVATARS */}
        <Section title="Avatars" subtitle="Profile images">
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <Avatar size="xs" />
              <Avatar size="sm" />
              <Avatar size="md" />
              <Avatar size="lg" />
              <Avatar size="xl" name="John Doe" />
            </View>
            <View className="flex-row items-center gap-3">
              <Avatar name="Jane Smith" size="md" />
              <Avatar icon="cutlery" size="md" />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Avatar Group:
            </Text>
            <AvatarGroup
              avatars={[
                { name: 'Anna' },
                { name: 'Carlos' },
                { name: 'Maria' },
                { name: 'John' },
                { name: 'Peter' },
                { name: 'Lucy' },
              ]}
              max={4}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* DIVIDERS */}
        <Section title="Dividers" subtitle="Content separators">
          <View className="gap-4">
            <Divider />
            <DividerWithText text="or" />
            <DividerWithText text="continue with" />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* PROGRESS */}
        <Section title="Progress" subtitle="Progress bars">
          <View className="gap-4">
            <ProgressBar progress={45} showLabel />
            <ProgressBar progress={75} showLabel labelPosition="top" />
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Stepper Progress:
            </Text>
            <StepperProgress
              steps={['Info', 'Preferences', 'Allergies', 'Confirm']}
              currentStep={1}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* CARDS */}
        <Section title="Cards" subtitle="Information containers">
          <View className="gap-4">
            <Card>
              <CardHeader
                title="Basic Card"
                subtitle="Optional subtitle"
                right={<IconButton icon="ellipsis-h" size="sm" />}
              />
              <CardContent>
                <Text style={{ color: colors.text }}>
                  Card content. Can contain any element.
                </Text>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Accept</Button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Outlined Card" />
              <CardContent>
                <Text style={{ color: colors.textSecondary }}>
                  Outlined variant for lists.
                </Text>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader title="Elevated Card" />
              <CardContent>
                <Text style={{ color: colors.textSecondary }}>
                  With shadow for emphasis.
                </Text>
              </CardContent>
            </Card>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* RECIPE CARDS */}
        <Section title="Recipe Cards" subtitle="Specific cards for recipes">
          <View className="gap-4">
            <RecipeCard
              title="Pasta Carbonara"
              description="Delicious Italian pasta with egg, pecorino cheese and crispy pancetta"
              time="30 min"
              servings={4}
              calories={520}
              difficulty="medium"
              tags={['Italian', 'Pasta', 'Quick']}
              isFavorite={favoriteRecipe}
              onFavoritePress={() => setFavoriteRecipe(!favoriteRecipe)}
              onPress={() => {}}
            />

            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Compact variant:
            </Text>
            <RecipeCard
              variant="compact"
              title="Caesar Salad"
              time="15 min"
              servings={2}
              calories={350}
              onPress={() => {}}
            />

            <Text style={{ color: colors.textSecondary }} className="text-sm">
              Horizontal variant:
            </Text>
            <RecipeCard
              variant="horizontal"
              title="Lemon Chicken"
              description="Juicy chicken marinated with lemon and aromatic herbs"
              time="45 min"
              servings={4}
              calories={380}
              difficulty="easy"
              onPress={() => {}}
            />
          </View>
        </Section>

        <Divider className="my-4" />

        {/* LIST ITEMS */}
        <Section title="List Items" subtitle="List elements">
          <ListGroup header="Settings">
            <ListItem
              leftIcon="user"
              title="Profile"
              subtitle="Edit your information"
              showChevron
              onPress={() => {}}
            />
            <ListItem
              leftIcon="bell"
              title="Notifications"
              right={<Switch value={switchValue} onValueChange={setSwitchValue} />}
            />
            <ListItem
              leftIcon="globe"
              title="Language"
              right={<Text style={{ color: colors.textSecondary }}>English</Text>}
              showChevron
              onPress={() => {}}
            />
          </ListGroup>
        </Section>

        <Divider className="my-4" />

        {/* LOADERS */}
        <Section title="Loaders" subtitle="Loading states">
          <View className="gap-4">
            <View className="flex-row items-center justify-around">
              <Loader size="sm" showText={false} />
              <Loader size="md" showText={false} />
              <Loader size="lg" showText={false} />
            </View>
            <Loader variant="inline" text="Loading recipes..." />
            <Card>
              <Loader text="Generating with AI..." />
            </Card>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* EMPTY STATES */}
        <Section title="Empty States" subtitle="Empty state displays">
          <View className="gap-4">
            <Card>
              <EmptyState
                icon="search"
                title="No recipes found"
                description="Try different search terms or filters"
                actionLabel="Clear filters"
                onAction={() => {}}
              />
            </Card>
          </View>
        </Section>

        <Divider className="my-4" />

        {/* MODALS */}
        <Section title="Modals" subtitle="Modal windows">
          <View className="flex-row flex-wrap gap-3">
            <Button variant="outline" onPress={() => setAlertVisible(true)}>
              Alert Modal
            </Button>
            <Button variant="outline" onPress={() => setBottomSheetVisible(true)}>
              Bottom Sheet
            </Button>
            <Button variant="outline" onPress={() => setFullScreenVisible(true)}>
              Full Screen
            </Button>
          </View>
        </Section>

        <View className="h-20" />
      </ScrollView>

      {/* Fixed FAB using IconButton with shadow */}
      <View
        className="absolute bottom-6 right-6"
        style={{
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          borderRadius: 28,
        }}
      >
        <IconButton icon="magic" size="xl" variant="primary" onPress={() => {}} />
      </View>

      {/* Modals */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Delete recipe?"
        message="This action cannot be undone. The recipe will be permanently deleted."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => console.log('Deleted!')}
      />

      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title="Filters"
      >
        <View className="gap-4 pb-6">
          <Text style={{ color: colors.text }} className="font-medium">
            Difficulty
          </Text>
          <ChipGroup
            chips={difficultyOptions}
            selectedIds={difficultyValue}
            onSelectionChange={setDifficultyValue}
            multiple={false}
          />
          <NumberInput
            label="Max time (minutes)"
            value={numberValue}
            onChange={setNumberValue}
            min={5}
            max={120}
            step={5}
            unit="min"
          />
          <Text style={{ color: colors.text }} className="font-medium">
            Meal type
          </Text>
          <ChipGroup
            chips={chipOptions}
            selectedIds={selectedChips}
            onSelectionChange={setSelectedChips}
          />
          <Button fullWidth onPress={() => setBottomSheetVisible(false)}>
            Apply filters
          </Button>
        </View>
      </BottomSheet>

      <FullScreenModal
        visible={fullScreenVisible}
        onClose={() => setFullScreenVisible(false)}
        title="Full Screen Modal"
        rightAction={<Button size="sm" variant="ghost">Save</Button>}
      >
        <ScrollView className="flex-1 p-4">
          <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
            Full Screen Modal Content
          </Text>
          <Text style={{ color: colors.textSecondary }} className="mb-4">
            This modal takes up the entire screen and is useful for forms,
            detailed views, or any content that needs more space.
          </Text>
          <Input
            label="Example Input"
            placeholder="Type something..."
            value={inputValue}
            onChangeText={setInputValue}
          />
          <View className="mt-4">
            <Button fullWidth onPress={() => setFullScreenVisible(false)}>
              Close Modal
            </Button>
          </View>
        </ScrollView>
      </FullScreenModal>
    </View>
  );
}
