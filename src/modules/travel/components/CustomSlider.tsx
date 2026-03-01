import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { colors } from '@/constants/colors';

interface CustomSliderProps {
  min: number;
  max: number;
  value: number | [number, number];
  onChange: (value: number | [number, number]) => void;
  range?: boolean;
  step?: number;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  formatValue?: (value: number) => string;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  value,
  onChange,
  range = false,
  step = 1,
  label,
  leftLabel,
  rightLabel,
  formatValue,
}) => {
  const sliderWidth = 280;
  const trackHeight = 6;
  const handleSize = 20;

  const formatValueDefault = (val: number) => {
    if (formatValue) return formatValue(val);
    return Math.round(val).toString();
  };

  const getValueFromPosition = (x: number): number => {
    const percentage = Math.max(0, Math.min(1, x / sliderWidth));
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const getPositionFromValue = (val: number): number => {
    const percentage = (val - min) / (max - min);
    return percentage * sliderWidth;
  };

  const singleValue = range ? null : (value as number);
  const rangeValue = range ? (value as [number, number]) : null;

  const singlePosition = singleValue !== null ? getPositionFromValue(singleValue) : 0;
  const rangeStartPosition = rangeValue ? getPositionFromValue(rangeValue[0]) : 0;
  const rangeEndPosition = rangeValue ? getPositionFromValue(rangeValue[1]) : 0;

  const singleAnim = React.useRef(new Animated.Value(singlePosition)).current;
  const rangeStartAnim = React.useRef(new Animated.Value(rangeStartPosition)).current;
  const rangeEndAnim = React.useRef(new Animated.Value(rangeEndPosition)).current;

  React.useEffect(() => {
    if (!range && singleValue !== null) {
      Animated.spring(singleAnim, {
        toValue: getPositionFromValue(singleValue),
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    } else if (range && rangeValue) {
      Animated.parallel([
        Animated.spring(rangeStartAnim, {
          toValue: getPositionFromValue(rangeValue[0]),
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(rangeEndAnim, {
          toValue: getPositionFromValue(rangeValue[1]),
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  }, [value]);

  const createPanResponder = (isStart: boolean = false) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Haptic feedback could be added here
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = gestureState.moveX - 20; // Adjust for padding
        const newValue = getValueFromPosition(newX);

        if (range && rangeValue) {
          if (isStart) {
            const newRange: [number, number] = [
              Math.min(newValue, rangeValue[1] - step),
              rangeValue[1],
            ];
            onChange(newRange);
          } else {
            const newRange: [number, number] = [
              rangeValue[0],
              Math.max(newValue, rangeValue[0] + step),
            ];
            onChange(newRange);
          }
        } else {
          onChange(newValue);
        }
      },
      onPanResponderRelease: () => {
        // Release handling
      },
    });
  };

  const singlePanResponder = createPanResponder(false);
  const rangeStartPanResponder = createPanResponder(true);
  const rangeEndPanResponder = createPanResponder(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          {range && rangeValue ? (
            <>
              <Animated.View
                style={[
                  styles.activeTrack,
                  {
                    left: rangeStartAnim,
                    width: Animated.subtract(rangeEndAnim, rangeStartAnim),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.handle,
                  {
                    left: Animated.subtract(rangeStartAnim, handleSize / 2),
                  },
                ]}
                {...rangeStartPanResponder.panHandlers}
              />
              <Animated.View
                style={[
                  styles.handle,
                  {
                    left: Animated.subtract(rangeEndAnim, handleSize / 2),
                  },
                ]}
                {...rangeEndPanResponder.panHandlers}
              />
            </>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.activeTrack,
                  {
                    width: singleAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.handle,
                  {
                    left: Animated.subtract(singleAnim, handleSize / 2),
                  },
                ]}
                {...singlePanResponder.panHandlers}
              />
            </>
          )}
        </View>
      </View>
      <View style={styles.labels}>
        {range && rangeValue ? (
          <>
            <Text style={styles.labelText}>
              {leftLabel || formatValueDefault(rangeValue[0])}
            </Text>
            <Text style={styles.labelText}>
              {rightLabel || formatValueDefault(rangeValue[1])}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.labelText}>
              {leftLabel || formatValueDefault(min)}
            </Text>
            <Text style={[styles.labelText, styles.labelTextBold]}>
              {rightLabel || formatValueDefault(singleValue || min)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  sliderContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  track: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    position: 'relative',
    width: 280,
  },
  activeTrack: {
    height: 6,
    backgroundColor: colors.primary[600],
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  handle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary[600],
    position: 'absolute',
    top: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  labelTextBold: {
    fontWeight: '600',
    color: colors.primary[600],
  },
});








