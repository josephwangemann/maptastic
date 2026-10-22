import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getVariableValue,
  H4,
  Paragraph,
  Spinner,
  useTheme,
  XStack,
  YStack,
} from "tamagui";
import { config } from "../../tamagui.config";
import { searchMap, type MapSearchResult } from "../lib/mapSearch";
import { nativeStyles } from "../theme/nativeStyles";
import { Button, pressOpacity } from "./Button";
import { SearchIcon } from "./SearchIcon";
import { Backdrop, SheetBackground, SheetHandle } from "./SheetChrome";

const snapPoints = ["99%"];

type SearchSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  proximity?: [number, number];
  onSelect: (result: MapSearchResult) => void;
};

export const SearchSheet = ({
  sheetRef,
  proximity,
  onSelect,
}: SearchSheetProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attribution, setAttribution] = useState("");
  const [searched, setSearched] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  useEffect(() => () => requestRef.current?.abort(), []);

  const clearResults = () => {
    requestRef.current?.abort();
    setResults([]);
    setAttribution("");
    setLoading(false);
    setError(null);
    setSearched(false);
  };
  const submitSearch = async () => {
    if (!query.trim()) return;
    clearResults();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setSearched(true);
    try {
      const response = await searchMap(query, proximity, controller.signal);
      if (controller.signal.aborted) return;
      setResults(response.results);
      setAttribution(response.attribution);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Couldn't search the map. Please try again.",
        );
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={Backdrop}
      backgroundComponent={SheetBackground}
      handleComponent={SheetHandle}
      topInset={insets.top}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustResize"
      onDismiss={() => {
        Keyboard.dismiss();
        clearResults();
        setQuery("");
      }}
    >
      <YStack px="5" pt="2" pb="3" gap="3">
        <H4>Search</H4>
        <XStack
          ai="center"
          gap="2"
          pl="3"
          bg="buttonBackground"
          bw={1}
          bc="border-color"
        >
          <Button
            w={44}
            h={48}
            p={0}
            bg="buttonBackground"
            accessibilityLabel="Search map"
            accessibilityState={{
              busy: loading,
              disabled: !query.trim() || loading,
            }}
            disabled={!query.trim() || loading}
            onPress={() => {
              Keyboard.dismiss();
              void submitSearch();
            }}
          >
            {loading ? <Spinner c="color" /> : <SearchIcon />}
          </Button>
          <BottomSheetTextInput
            style={nativeStyles({
              f: 1,
              c: theme.color.val,
              ff: getVariableValue(config.fonts.body.family),
              fs: 16,
              minH: 52,
              px: 12,
              py: 12,
            })}
            value={query}
            onChangeText={(text) => {
              clearResults();
              setQuery(text);
            }}
            placeholder=""
            placeholderTextColor={theme["placeholder-color"].val}
            selectionColor={theme.color.val}
            cursorColor={theme.color.val}
            keyboardAppearance="dark"
            accessibilityLabel="Search places and addresses"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={256}
            returnKeyType="search"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              void submitSearch();
            }}
          />
          {query.length > 0 ? (
            <Button
              size="sm"
              bg="buttonBackground"
              c="color"
              accessibilityLabel="Clear search"
              onPress={() => {
                clearResults();
                setQuery("");
              }}
            >
              Clear
            </Button>
          ) : null}
        </XStack>
        <Paragraph
          fs={13}
          c="placeholder-color"
          accessibilityLiveRegion="polite"
        >
          {loading
            ? "Searching…"
            : (error ?? (searched ? `${results.length} results` : ""))}
        </Paragraph>
      </YStack>
      <BottomSheetFlatList<MapSearchResult>
        data={results}
        keyExtractor={({ id }) => id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          !loading && !error && searched ? (
            <YStack px="5" py="4" gap="2">
              <Paragraph>No places found</Paragraph>
              <Paragraph c="placeholder-color">
                Try a different name or include a city.
              </Paragraph>
            </YStack>
          ) : undefined
        }
        ListFooterComponent={
          <YStack px="5" pt="3" pb={insets.bottom + 24}>
            {attribution ? (
              <Paragraph fs={12} c="placeholder-color">
                {attribution}
              </Paragraph>
            ) : null}
          </YStack>
        }
        renderItem={({ item }) => (
          <XStack
            px="5"
            py="3"
            gap="3"
            ai="center"
            minH={64}
            o={pressOpacity}
            accessibilityRole="button"
            accessibilityLabel={`Show ${item.name} on map`}
            onPress={() => {
              Keyboard.dismiss();
              onSelect(item);
              sheetRef.current?.dismiss();
            }}
          >
            <SearchIcon />
            <YStack f={1}>
              <Paragraph fw="600">{item.name}</Paragraph>
              <Paragraph fs={12} c="placeholder-color">
                {item.address}
              </Paragraph>
            </YStack>
          </XStack>
        )}
      />
    </BottomSheetModal>
  );
};
