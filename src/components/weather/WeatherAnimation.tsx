// ============================================================
// NusaWeather — src/components/weather/WeatherAnimation.tsx
// ============================================================
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, {
    Circle,
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    Stop,
} from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const AW = SW - 32;
const AH = 200;

// ─── Animated SVG wrappers ────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// ☀️ CLEAR DAY
// ═══════════════════════════════════════════════════════════════
const SunAnimation: React.FC<{ size?: number }> = ({ size = 90 }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const ray1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ray1, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ray1, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rayOpacity = ray1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const rayScale = ray1.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.1] });

  const cx = AW / 2;
  const cy = AH / 2;
  const r = size / 2;
  const rays = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={styles.animContainer}>
      {/* Glow background */}
      <Animated.View
        style={[
          styles.sunGlow,
          {
            width: size * 2.2,
            height: size * 2.2,
            borderRadius: size * 1.1,
            transform: [{ scale: pulse }],
          },
        ]}
      />
      <Svg width={AW} height={AH}>
        <Defs>
          <LinearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFE066" />
            <Stop offset="100%" stopColor="#FF9500" />
          </LinearGradient>
          <LinearGradient id="glowGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#FFE066" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Glow circle */}
        <Circle cx={cx} cy={cy} r={r * 1.8} fill="url(#glowGrad)" />
      </Svg>

      {/* Rays */}
      <Animated.View
        style={[
          styles.raysContainer,
          {
            opacity: rayOpacity,
            transform: [{ scale: rayScale }, { rotate: spin }],
          },
        ]}
      >
        {rays.map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.ray,
              {
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 22 : 16,
                transform: [
                  { rotate: `${(i * 360) / 12}deg` },
                  { translateY: -(r + (i % 3 === 0 ? 14 : 10)) },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Sun core */}
      <Animated.View
        style={[
          styles.sunCore,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: pulse }],
          },
        ]}
      />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🌧️ RAIN
// ═══════════════════════════════════════════════════════════════
interface RainDrop {
  x: number;
  y: Animated.Value;
  opacity: Animated.Value;
  delay: number;
  speed: number;
  size: number;
  angle: number;
}

const RainAnimation: React.FC<{ heavy?: boolean }> = ({ heavy = false }) => {
  const dropCount = heavy ? 40 : 24;
  const cloudBob = useRef(new Animated.Value(0)).current;

  const drops = useRef<RainDrop[]>(
    Array.from({ length: dropCount }, (_, i) => ({
      x: Math.random() * AW,
      y: new Animated.Value(-20 - Math.random() * 100),
      opacity: new Animated.Value(0),
      delay: Math.random() * 2000,
      speed: 600 + Math.random() * 600,
      size: heavy ? 2 + Math.random() * 2 : 1.5 + Math.random() * 1.5,
      angle: heavy ? -15 + Math.random() * 10 : -8 + Math.random() * 6,
    }))
  ).current;

  useEffect(() => {
    // Cloud bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudBob, { toValue: 6, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cloudBob, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Rain drops
    drops.forEach((drop) => {
      const animateDrop = () => {
        drop.y.setValue(-20);
        drop.opacity.setValue(0);
        Animated.parallel([
          Animated.sequence([
            Animated.delay(drop.delay),
            Animated.timing(drop.y, {
              toValue: AH + 20,
              duration: drop.speed,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(drop.delay),
            Animated.timing(drop.opacity, {
              toValue: heavy ? 0.8 : 0.6,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(drop.opacity, {
              toValue: 0,
              duration: drop.speed - 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateDrop());
      };
      animateDrop();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.animContainer}>
      {/* Drops */}
      {drops.map((drop, i) => (
        <Animated.View
          key={i}
          style={[
            styles.raindrop,
            {
              left: drop.x,
              width: drop.size,
              height: drop.size * (heavy ? 14 : 12),
              borderRadius: drop.size,
              opacity: drop.opacity,
              transform: [
                { translateY: drop.y },
                { rotate: `${drop.angle}deg` },
              ],
            },
          ]}
        />
      ))}

      {/* Clouds */}
      <Animated.View style={{ transform: [{ translateY: cloudBob }] }}>
        <Svg width={AW} height={120}>
          <Defs>
            <LinearGradient id="cloudDark" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#78909C" />
              <Stop offset="100%" stopColor="#546E7A" />
            </LinearGradient>
            <LinearGradient id="cloudDark2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#90A4AE" />
              <Stop offset="100%" stopColor="#607D8B" />
            </LinearGradient>
          </Defs>
          {/* Cloud back */}
          <Ellipse cx={AW * 0.6} cy={55} rx={90} ry={45} fill="url(#cloudDark)" opacity={0.7} />
          <Ellipse cx={AW * 0.6 + 70} cy={65} rx={55} ry={35} fill="url(#cloudDark)" opacity={0.7} />
          <Ellipse cx={AW * 0.6 - 60} cy={65} rx={50} ry={30} fill="url(#cloudDark)" opacity={0.7} />
          {/* Cloud front */}
          <Ellipse cx={AW * 0.35} cy={70} rx={100} ry={50} fill="url(#cloudDark2)" />
          <Ellipse cx={AW * 0.35 + 80} cy={80} rx={65} ry={40} fill="url(#cloudDark2)" />
          <Ellipse cx={AW * 0.35 - 70} cy={80} rx={60} ry={35} fill="url(#cloudDark2)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ⛅ CLOUDY
// ═══════════════════════════════════════════════════════════════
const CloudAnimation: React.FC<{ partlyCloudy?: boolean }> = ({ partlyCloudy = false }) => {
  const cloud1X = useRef(new Animated.Value(0)).current;
  const cloud2X = useRef(new Animated.Value(0)).current;
  const cloud1Y = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1X, { toValue: 12, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cloud1X, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud2X, { toValue: -10, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cloud2X, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1Y, { toValue: 8, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cloud1Y, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    if (partlyCloudy) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sunPulse, { toValue: 1.1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(sunPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.animContainer}>
      {partlyCloudy && (
        <Animated.View
          style={[
            styles.sunBehindCloud,
            { transform: [{ scale: sunPulse }] },
          ]}
        />
      )}

      <Animated.View style={{ transform: [{ translateX: cloud2X }] }}>
        <Svg width={AW} height={AH} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="cloudBg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#CFD8DC" />
              <Stop offset="100%" stopColor="#B0BEC5" />
            </LinearGradient>
          </Defs>
          <Ellipse cx={AW * 0.7} cy={90} rx={85} ry={42} fill="url(#cloudBg)" opacity={0.6} />
          <Ellipse cx={AW * 0.7 + 65} cy={100} rx={50} ry={32} fill="url(#cloudBg)" opacity={0.6} />
          <Ellipse cx={AW * 0.7 - 55} cy={100} rx={48} ry={28} fill="url(#cloudBg)" opacity={0.6} />
        </Svg>
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateX: cloud1X }, { translateY: cloud1Y }] }}
      >
        <Svg width={AW} height={AH} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="cloudFg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ECEFF1" />
              <Stop offset="100%" stopColor="#CFD8DC" />
            </LinearGradient>
          </Defs>
          <Ellipse cx={AW * 0.38} cy={100} rx={100} ry={52} fill="url(#cloudFg)" />
          <Ellipse cx={AW * 0.38 + 85} cy={112} rx={62} ry={38} fill="url(#cloudFg)" />
          <Ellipse cx={AW * 0.38 - 72} cy={112} rx={58} ry={34} fill="url(#cloudFg)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ⛈️ THUNDERSTORM
// ═══════════════════════════════════════════════════════════════
const ThunderstormAnimation: React.FC = () => {
  const lightningOpacity = useRef(new Animated.Value(0)).current;
  const lightningOpacity2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flashLightning = (anim: Animated.Value, interval: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(interval),
          Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 80, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.7, duration: 60, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 120, useNativeDriver: true }),
          Animated.delay(interval * 1.5),
        ])
      ).start();
    };
    flashLightning(lightningOpacity, 2500);
    flashLightning(lightningOpacity2, 4200);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const boltPath = `M ${AW * 0.4} 60 L ${AW * 0.35} 110 L ${AW * 0.42} 110 L ${AW * 0.37} 160 L ${AW * 0.48} 100 L ${AW * 0.41} 100 Z`;
  const boltPath2 = `M ${AW * 0.65} 70 L ${AW * 0.61} 115 L ${AW * 0.67} 115 L ${AW * 0.63} 158 L ${AW * 0.72} 105 L ${AW * 0.66} 105 Z`;

  return (
    <View style={styles.animContainer}>
      <RainAnimation heavy />
      {/* Lightning flash 1 */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: lightningOpacity }]}>
        <Svg width={AW} height={AH}>
          <Defs>
            <LinearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFF176" />
              <Stop offset="100%" stopColor="#FFD600" />
            </LinearGradient>
          </Defs>
          <Path d={boltPath} fill="url(#boltGrad)" />
          <Path d={boltPath} fill="#FFF176" opacity={0.5} />
        </Svg>
      </Animated.View>
      {/* Lightning flash 2 */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: lightningOpacity2 }]}>
        <Svg width={AW} height={AH}>
          <Path d={boltPath2} fill="#FFF9C4" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ❄️ SNOW
// ═══════════════════════════════════════════════════════════════
interface Flake {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
  delay: number;
  speed: number;
  sway: number;
}

const SnowAnimation: React.FC = () => {
  const flakeCount = 30;
  const flakes = useRef<Flake[]>(
    Array.from({ length: flakeCount }, () => ({
      x: new Animated.Value(Math.random() * AW),
      y: new Animated.Value(-10),
      opacity: new Animated.Value(0),
      size: 3 + Math.random() * 5,
      delay: Math.random() * 3000,
      speed: 2500 + Math.random() * 2500,
      sway: 15 + Math.random() * 20,
    }))
  ).current;

  useEffect(() => {
    flakes.forEach((flake) => {
      const startX = Math.random() * AW;
      const animateFlake = () => {
        flake.x.setValue(startX);
        flake.y.setValue(-10);
        flake.opacity.setValue(0);
        Animated.parallel([
          Animated.sequence([
            Animated.delay(flake.delay),
            Animated.timing(flake.y, { toValue: AH + 10, duration: flake.speed, easing: Easing.linear, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(flake.delay),
            Animated.timing(flake.opacity, { toValue: 0.9, duration: 300, useNativeDriver: true }),
            Animated.timing(flake.opacity, { toValue: 0, duration: 400, delay: flake.speed - 700, useNativeDriver: true }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(flake.x, { toValue: startX + flake.sway, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
              Animated.timing(flake.x, { toValue: startX - flake.sway, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
          ),
        ]).start(() => animateFlake());
      };
      animateFlake();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.animContainer}>
      {flakes.map((flake, i) => (
        <Animated.View
          key={i}
          style={[
            styles.snowflake,
            {
              width: flake.size,
              height: flake.size,
              borderRadius: flake.size / 2,
              opacity: flake.opacity,
              transform: [{ translateX: flake.x }, { translateY: flake.y }],
            },
          ]}
        />
      ))}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🌙 CLEAR NIGHT
// ═══════════════════════════════════════════════════════════════
interface Star {
  x: number;
  y: number;
  opacity: Animated.Value;
  size: number;
  delay: number;
}

const NightAnimation: React.FC = () => {
  const moonFloat = useRef(new Animated.Value(0)).current;
  const moonGlow = useRef(new Animated.Value(1)).current;

  const stars = useRef<Star[]>(
    Array.from({ length: 35 }, () => ({
      x: Math.random() * AW,
      y: Math.random() * (AH * 0.7),
      opacity: new Animated.Value(0),
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 3000,
    }))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonFloat, { toValue: 8, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(moonFloat, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(moonGlow, { toValue: 1.15, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(moonGlow, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    stars.forEach((star) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(star.opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
          Animated.timing(star.opacity, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(star.opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.animContainer}>
      {/* Stars */}
      {stars.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* Moon glow */}
      <Animated.View
        style={[
          styles.moonGlow,
          { transform: [{ translateY: moonFloat }, { scale: moonGlow }] },
        ]}
      />

      {/* Moon */}
      <Animated.View
        style={[styles.moon, { transform: [{ translateY: moonFloat }] }]}
      >
        <Svg width={70} height={70}>
          <Defs>
            <LinearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFF9C4" />
              <Stop offset="100%" stopColor="#FFE082" />
            </LinearGradient>
          </Defs>
          <Circle cx={35} cy={35} r={28} fill="url(#moonGrad)" />
          {/* Crescent shadow */}
          <Circle cx={45} cy={28} r={22} fill="#1A3A5C" opacity={0.85} />
          {/* Craters */}
          <Circle cx={20} cy={42} r={3} fill="#FFD54F" opacity={0.4} />
          <Circle cx={30} cy={28} r={2} fill="#FFD54F" opacity={0.3} />
        </Svg>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🌫️ MIST / FOG
// ═══════════════════════════════════════════════════════════════
const MistAnimation: React.FC = () => {
  const fogs = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      x: new Animated.Value(i % 2 === 0 ? -AW * 0.3 : AW * 0.1),
      opacity: new Animated.Value(0.2 + i * 0.06),
      y: 30 + i * 30,
      width: AW * (0.8 + Math.random() * 0.4),
    }))
  ).current;

  useEffect(() => {
    fogs.forEach((fog, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      Animated.loop(
        Animated.sequence([
          Animated.timing(fog.x, {
            toValue: dir * AW * 0.15,
            duration: 5000 + i * 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fog.x, {
            toValue: dir * -AW * 0.1,
            duration: 5000 + i * 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.animContainer}>
      {fogs.map((fog, i) => (
        <Animated.View
          key={i}
          style={[
            styles.fogLayer,
            {
              top: fog.y,
              width: fog.width,
              opacity: fog.opacity,
              transform: [{ translateX: fog.x }],
            },
          ]}
        />
      ))}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT — pilih animasi sesuai icon cuaca
// ═══════════════════════════════════════════════════════════════
interface WeatherAnimationProps {
  icon: string; // OWM icon code e.g. "01d", "10n"
}

export const WeatherAnimation: React.FC<WeatherAnimationProps> = ({ icon }) => {
  const renderAnimation = () => {
    const code = icon?.slice(0, 2);
    const isNight = icon?.endsWith('n');

    switch (code) {
      case '01': return isNight ? <NightAnimation /> : <SunAnimation />;
      case '02': return <CloudAnimation partlyCloudy />;
      case '03': return <CloudAnimation />;
      case '04': return <CloudAnimation />;
      case '09': return <RainAnimation />;
      case '10': return isNight ? <RainAnimation /> : <RainAnimation />;
      case '11': return <ThunderstormAnimation />;
      case '13': return <SnowAnimation />;
      case '50': return <MistAnimation />;
      default:   return <SunAnimation />;
    }
  };

  return <View style={styles.wrapper}>{renderAnimation()}</View>;
};

// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  wrapper: {
    width: AW,
    height: AH,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 20,
  },
  animContainer: {
    width: AW,
    height: AH,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sun
  sunGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255,200,0,0.18)',
  },
  raysContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    backgroundColor: '#FFD600',
    borderRadius: 4,
    opacity: 0.85,
  },
  sunCore: {
    position: 'absolute',
    backgroundColor: '#FFD600',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  // Rain
  raindrop: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#90CAF9',
  },
  // Cloud
  sunBehindCloud: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD600',
    right: AW * 0.15,
    top: AH * 0.15,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 5,
  },
  // Snow
  snowflake: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#E3F2FD',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  // Night
  star: {
    position: 'absolute',
    backgroundColor: '#FFF9C4',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  moonGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,245,157,0.15)',
    right: AW * 0.12,
    top: AH * 0.1,
  },
  moon: {
    position: 'absolute',
    right: AW * 0.12,
    top: AH * 0.1,
  },
  // Mist
  fogLayer: {
    position: 'absolute',
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(176,190,197,0.6)',
    left: -AW * 0.1,
  },
});