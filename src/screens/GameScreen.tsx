import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { TextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/AppModal';
import { AppIcon } from '../components/ui/AppIcon';
import { AvatarBadge } from '../components/AvatarPicker';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { useHaptics } from '../hooks/useHaptics';
import { AnimatedButton, GlowButton } from '../components/AnimatedButton';
import { getRandomQuestions, getAIAnswer, GameQuestion } from '../data/gameQuestions';
import {
  createGameRoom,
  joinGameRoom,
  subscribeToGameRoom,
  startGameRoom,
} from '../firebase/syncService';

type GameMode = 'menu' | 'lobby' | 'playing';
type PlayerTurn = 'player1' | 'player2';

const TOTAL_QUESTIONS = 10;
const AI_THINKING_DURATION_MS = 1550;

export const GameScreen: React.FC<{ navigation: any }> = () => {
  const { colors } = useTheme();
  const { user, addXP } = useAppStore();
  const haptics = useHaptics();

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameType, setGameType] = useState<'ai' | 'multiplayer'>('ai');
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<PlayerTurn>('player1');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [scanningOptionIdx, setScanningOptionIdx] = useState<number | null>(null);
  const [thinkingStage, setThinkingStage] = useState<number>(0);
  const player1Name = user?.displayName || 'You';
  const [player2Name, setPlayer2Name] = useState('Robot');

  // Room code system
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);

  // Modal state
  const [showJoinErrorModal, setShowJoinErrorModal] = useState(false);
  const [showCodeCopiedModal, setShowCodeCopiedModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [joinErrorMsg, setJoinErrorMsg] = useState('');

  const turnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations for Human vs Robot turn & Robot thinking state
  const turnBannerScale = useRef(new Animated.Value(1)).current;
  const botFloatAnim = useRef(new Animated.Value(0)).current;
  const botTiltAnim = useRef(new Animated.Value(0)).current;
  const botHaloAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const thinkingProgressAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentQuestionIdx];
  const isAITurn = gameMode === 'playing' && gameType === 'ai' && currentTurn === 'player2';

  // Clean up pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    };
  }, []);

  // Animate turn banner whenever turn switches between Human and Robot/Player 2
  useEffect(() => {
    if (gameMode !== 'playing' || gameOver) return;
    turnBannerScale.setValue(0.88);
    Animated.spring(turnBannerScale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [currentTurn, currentQuestionIdx, gameMode, gameOver]);

  // Animate Robot thinking character, dots, progress bar, and option scanning
  useEffect(() => {
    if (!isAITurn || showResult || gameOver || !currentQuestion) {
      setScanningOptionIdx(null);
      setThinkingStage(0);
      thinkingProgressAnim.setValue(0);
      return;
    }

    // 1. Floating & tilting robot head animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(botFloatAnim, {
          toValue: -5,
          duration: 360,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(botFloatAnim, {
          toValue: 0,
          duration: 360,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(botTiltAnim, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(botTiltAnim, {
          toValue: -1,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(botHaloAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(botHaloAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Bouncing 3 dots animation
    const createDotLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -5,
            duration: 240,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 240,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 360 - delay)),
        ])
      );

    const dot1Loop = createDotLoop(dot1Anim, 0);
    const dot2Loop = createDotLoop(dot2Anim, 140);
    const dot3Loop = createDotLoop(dot3Anim, 280);

    // 3. Thinking progress bar fill (0 -> 1 over AI_THINKING_DURATION_MS)
    thinkingProgressAnim.setValue(0);
    const progressTiming = Animated.timing(thinkingProgressAnim, {
      toValue: 1,
      duration: AI_THINKING_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });

    floatLoop.start();
    tiltLoop.start();
    haloLoop.start();
    dot1Loop.start();
    dot2Loop.start();
    dot3Loop.start();
    progressTiming.start();

    // 4. Option scanning cycle so the user sees the Robot evaluating options A, B, C, D
    const optionCount = currentQuestion.options.length || 4;
    let step = 0;
    setScanningOptionIdx(0);
    setThinkingStage(0);

    const scanInterval = setInterval(() => {
      step += 1;
      setScanningOptionIdx(step % optionCount);
      if (step === 2) setThinkingStage(1);
      if (step === 4) setThinkingStage(2);
    }, 250);

    // 5. Commit AI choice when thinking completes
    const aiTimer = setTimeout(() => {
      clearInterval(scanInterval);
      setScanningOptionIdx(null);
      const aiChoice = getAIAnswer(currentQuestion);
      handleAnswer(aiChoice, true);
    }, AI_THINKING_DURATION_MS);

    return () => {
      clearInterval(scanInterval);
      clearTimeout(aiTimer);
      floatLoop.stop();
      tiltLoop.stop();
      haloLoop.stop();
      dot1Loop.stop();
      dot2Loop.stop();
      dot3Loop.stop();
      progressTiming.stop();
      botFloatAnim.setValue(0);
      botTiltAnim.setValue(0);
      botHaloAnim.setValue(0);
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    };
  }, [isAITurn, showResult, gameOver, currentQuestionIdx, currentQuestion]);

  // Subscribe to room updates for host (see when joiner joins)
  useEffect(() => {
    if (!isHost || !roomCode || gameMode !== 'lobby') return;
    const unsub = subscribeToGameRoom(roomCode, (room) => {
      if (room && room.status === 'joined' && room.joinerName) {
        setOpponentJoined(true);
        setPlayer2Name(room.joinerName);
      }
    });
    return unsub;
  }, [isHost, roomCode, gameMode]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startAIGame = () => {
    haptics.lightTap();
    if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    const qs = getRandomQuestions(TOTAL_QUESTIONS);
    setQuestions(qs);
    setCurrentQuestionIdx(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentTurn('player1');
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setGameType('ai');
    setPlayer2Name('Robot');
    setGameMode('playing');
  };

  const startPassAndPlay = () => {
    haptics.lightTap();
    if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    const qs = getRandomQuestions(TOTAL_QUESTIONS);
    setQuestions(qs);
    setCurrentQuestionIdx(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentTurn('player1');
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setGameType('multiplayer');
    setPlayer2Name('Player 2');
    setGameMode('playing');
  };

  const createRoom = async () => {
    haptics.lightTap();
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setRoomCreated(true);
    setOpponentJoined(false);
    setGameMode('lobby');
    try {
      await createGameRoom(code, user?.uid || 'local', player1Name);
    } catch {
      // Offline fallback
    }
  };

  const handleShareRoomCode = async () => {
    haptics.lightTap();
    setCopiedCode(roomCode);
    try {
      await Share.share({
        message: `Ngwino dukine Ibisakuzo kuri Menya! Kode y'iciro: ${roomCode}`,
      });
    } catch {
      setShowCodeCopiedModal(true);
    }
  };

  const joinRoom = async () => {
    haptics.lightTap();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinErrorMsg("Nyamuneka shyiramo kode y'iciro");
      setShowJoinErrorModal(true);
      return;
    }
    if (code.length !== 6) {
      setJoinErrorMsg('Kode igomba kuba ifite inyuguti 6');
      setShowJoinErrorModal(true);
      return;
    }
    let success = false;
    try {
      success = await joinGameRoom(code, user?.uid || 'local', player1Name);
    } catch {
      success = false;
    }
    if (!success) {
      setJoinErrorMsg(
        "Iciro ntiryabonetse cyangwa ryamaze gutangira. Gerageza indi kode cyangwa ukine Pass & Play."
      );
      setShowJoinErrorModal(true);
      return;
    }
    setRoomCode(code);
    setIsHost(false);
    setPlayer2Name('Umugenzi');
    setRoomCreated(true);
    setOpponentJoined(true);
    setGameMode('lobby');
  };

  const startGameFromLobby = () => {
    haptics.lightTap();
    if (roomCode) {
      startGameRoom(roomCode);
    }
    const qs = getRandomQuestions(TOTAL_QUESTIONS);
    setQuestions(qs);
    setCurrentQuestionIdx(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentTurn('player1');
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setGameType('multiplayer');
    setGameMode('playing');
  };

  const handleAnswer = (answer: string, fromAI = false) => {
    if (showResult || gameOver || !currentQuestion) return;
    if (gameType === 'ai' && currentTurn === 'player2' && !fromAI) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      haptics.success();
    } else {
      haptics.mistake();
    }

    const nextP1Score =
      currentTurn === 'player1' && correct ? player1Score + 1 : player1Score;
    const nextP2Score =
      currentTurn === 'player2' && correct ? player2Score + 1 : player2Score;

    if (correct) {
      if (currentTurn === 'player1') {
        setPlayer1Score(nextP1Score);
      } else {
        setPlayer2Score(nextP2Score);
      }
    }

    if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    turnTimeoutRef.current = setTimeout(() => {
      if (currentQuestionIdx + 1 >= TOTAL_QUESTIONS) {
        setGameOver(true);
        haptics.celebration();
        if (nextP1Score > nextP2Score) {
          addXP(75);
        } else if (nextP2Score > nextP1Score) {
          addXP(15); // Participation XP so learning effort is still rewarded
        } else {
          addXP(50);
        }
      } else {
        setCurrentQuestionIdx((i) => i + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setCurrentTurn((t) => (t === 'player1' ? 'player2' : 'player1'));
      }
    }, 1350);
  };

  const resetGame = () => {
    haptics.lightTap();
    if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    setGameMode('menu');
    setCurrentQuestionIdx(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setRoomCreated(false);
    setIsHost(false);
    setRoomCode('');
    setJoinCode('');
    setOpponentJoined(false);
    setJoinErrorMsg('');
    setPlayer2Name('Robot');
  };

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title="Ibisakuzo"
          subtitle="Riddles & Quiz · 10 questions"
          right={
            <View style={[styles.xpPill, { backgroundColor: colors.secondary + '18' }]}>
              <AppIcon name="star" size={13} color={colors.secondary} />
              <Text style={[styles.xpPillText, { color: colors.secondary }]}>+75 XP</Text>
            </View>
          }
        />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hitamo Uburyo bwo Gukina
          </Text>

          {/* Play vs AI */}
          <AnimatedButton
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={startAIGame}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.primary + '20' }]}>
              <AppIcon name="bot" size={30} color={colors.primary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>
                Kina na Robot (vs AI)
              </Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Turn-based 10-question Kinyarwanda riddle & vocab match
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary + '22' }]}>
              <AppIcon name="star" size={13} color={colors.secondary} />
              <Text style={[styles.modeRewardText, { color: colors.secondary }]}>75 XP</Text>
            </View>
          </AnimatedButton>

          {/* Local Pass & Play */}
          <AnimatedButton
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={startPassAndPlay}
          >
            <View style={[styles.modeIcon, { backgroundColor: '#7C5CBF20' }]}>
              <AppIcon name="users" size={30} color="#7C5CBF" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>
                Pass & Play (Abakinnyi 2)
              </Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Play together with a friend on this device, taking turns
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary + '22' }]}>
              <AppIcon name="star" size={13} color={colors.secondary} />
              <Text style={[styles.modeRewardText, { color: colors.secondary }]}>75 XP</Text>
            </View>
          </AnimatedButton>

          {/* Create Room */}
          <AnimatedButton
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={createRoom}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.xpOrange + '20' }]}>
              <AppIcon name="share" size={28} color={colors.xpOrange} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Fungura Iciro</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Create a 6-letter room code & share with a friend
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary + '22' }]}>
              <AppIcon name="star" size={13} color={colors.secondary} />
              <Text style={[styles.modeRewardText, { color: colors.secondary }]}>75 XP</Text>
            </View>
          </AnimatedButton>

          {/* Join Room */}
          <AnimatedButton
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              haptics.lightTap();
              setGameMode('lobby');
            }}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.success + '20' }]}>
              <AppIcon name="key" size={28} color={colors.success} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Jya mu Iciro</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Enter a friend's 6-letter room code to join
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary + '22' }]}>
              <AppIcon name="star" size={13} color={colors.secondary} />
              <Text style={[styles.modeRewardText, { color: colors.secondary }]}>75 XP</Text>
            </View>
          </AnimatedButton>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // Lobby Screen
  if (gameMode === 'lobby') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          onBack={resetGame}
          title={isHost ? 'Iciro cyawe' : roomCreated ? 'Wabonetse Iciro' : 'Jya mu Iciro'}
          subtitle={
            isHost
              ? "Gabana kode n'umugenzi"
              : roomCreated
                ? `Ugomba gukina na ${player2Name}`
                : "Shyiramo kode y'iciro"
          }
        />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {isHost ? (
            // Host view - waiting for opponent
            <View style={[styles.roomCodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Player names */}
              <View style={styles.playerRow}>
                <View style={[styles.playerAvatar, { backgroundColor: colors.primary }]}>
                  <AppIcon name="user" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                  {player1Name}
                </Text>
                <Text style={[styles.vsLabel, { color: colors.textMuted }]}>vs</Text>
                <View
                  style={[
                    styles.playerAvatar,
                    { backgroundColor: opponentJoined ? colors.xpOrange : colors.border },
                  ]}
                >
                  <AppIcon name={opponentJoined ? 'user' : 'help'} size={20} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.playerName,
                    { color: opponentJoined ? colors.text : colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {opponentJoined ? player2Name : 'Gutegereza...'}
                </Text>
              </View>

              <View style={[styles.roomCodeBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.roomCode, { color: colors.primary }]}>{roomCode}</Text>
              </View>
              <AnimatedButton
                style={[styles.copyBtn, { backgroundColor: colors.primary }]}
                onPress={handleShareRoomCode}
              >
                <AppIcon name="share" size={18} color="#FFFFFF" />
                <Text style={styles.copyBtnText}>Sangiza / Share Kode</Text>
              </AnimatedButton>

              {opponentJoined ? (
                <AnimatedButton
                  style={[styles.startBtn, { backgroundColor: colors.success }]}
                  onPress={startGameFromLobby}
                >
                  <Text style={styles.startBtnText}>Tangira Ukina!</Text>
                </AnimatedButton>
              ) : (
                <View style={[styles.waitingBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.waitingText, { color: colors.textSecondary }]}>
                    Gutegereza umukiriya...
                  </Text>
                  <Text style={[styles.waitingHint, { color: colors.textMuted }]}>
                    Gabana iyi kode: {roomCode}
                  </Text>
                </View>
              )}
            </View>
          ) : roomCreated ? (
            // Joiner view - opponent found, ready to play
            <View style={[styles.roomCodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.playerRow}>
                <View style={[styles.playerAvatar, { backgroundColor: colors.primary }]}>
                  <AppIcon name="user" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                  {player1Name}
                </Text>
                <Text style={[styles.vsLabel, { color: colors.textMuted }]}>vs</Text>
                <View style={[styles.playerAvatar, { backgroundColor: colors.xpOrange }]}>
                  <AppIcon name="user" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                  {player2Name}
                </Text>
              </View>

              <AnimatedButton
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={startGameFromLobby}
              >
                <Text style={styles.startBtnText}>Tangira Ukina!</Text>
              </AnimatedButton>
            </View>
          ) : (
            // Join Room - Enter code
            <View style={[styles.joinRoomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.joinLabel, { color: colors.text }]}>
                Shyiramo Kode y'Iciro
              </Text>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: joinCode.length === 6 ? colors.primary : colors.border,
                  },
                ]}
                placeholder="ABCDEF"
                placeholderTextColor={colors.textMuted}
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />
              {joinCode.length > 0 && joinCode.length < 6 && (
                <Text style={[styles.codeHint, { color: colors.textMuted }]}>
                  Kode igomba kuba ifite inyuguti 6
                </Text>
              )}
              <AnimatedButton
                style={[
                  styles.joinBtn,
                  {
                    backgroundColor: joinCode.length >= 6 ? colors.primary : colors.border,
                  },
                ]}
                onPress={joinRoom}
                disabled={joinCode.length < 6}
              >
                <Text style={styles.joinBtnText}>Jya mu Iciro</Text>
              </AnimatedButton>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <AppModal
          visible={showJoinErrorModal}
          title="Ikosa"
          message={joinErrorMsg}
          type="error"
          icon="link"
          showCancel={false}
          confirmText="Sawe"
          onConfirm={() => setShowJoinErrorModal(false)}
        />

        <AppModal
          visible={showCodeCopiedModal}
          title="Kode y'Iciro"
          message={`Kode y'iciro: ${copiedCode}`}
          type="success"
          icon="copy"
          showCancel={false}
          confirmText="Sawe"
          onConfirm={() => setShowCodeCopiedModal(false)}
        />
      </View>
    );
  }

  const botRotation = botTiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-12deg', '12deg'],
  });

  const botHaloScale = botHaloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.32],
  });

  const botHaloOpacity = botHaloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.08],
  });

  const thinkingWidth = thinkingProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['6%', '100%'],
  });

  const thinkingMessages = [
    'Robot irimo gusoma ikibazo... (Reading riddle)',
    'Robot irimo gusesengura... (Evaluating options)',
    'Robot igiye gusubiza! (Locking in answer)',
  ];

  // Playing Screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Game Header */}
      <ScreenHeader
        onBack={resetGame}
        backIcon="close"
        title="Ibisakuzo"
        subtitle={`${gameType === 'ai' ? 'vs Robot' : `vs ${player2Name}`} · Q${currentQuestionIdx + 1}/${TOTAL_QUESTIONS}`}
        progress={(currentQuestionIdx + (showResult ? 1 : 0)) / TOTAL_QUESTIONS}
      >
        <View style={[styles.scoreBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View
            style={[
              styles.scorePlayer,
              currentTurn === 'player1' && !gameOver && {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary + '45',
                borderWidth: 1,
              },
            ]}
          >
            <AvatarBadge id={user.avatar} photoUri={user.photoUri} size={24} />
            <Text style={[styles.scoreName, { color: colors.text }]} numberOfLines={1}>
              {player1Name}
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.scoreBadgeText}>{player1Score}</Text>
            </View>
          </View>
          <Text style={[styles.scoreVs, { color: colors.textMuted }]}>vs</Text>
          <View
            style={[
              styles.scorePlayer,
              currentTurn === 'player2' && !gameOver && {
                backgroundColor: (gameType === 'ai' ? colors.xpOrange : '#7C5CBF') + '15',
                borderColor: (gameType === 'ai' ? colors.xpOrange : '#7C5CBF') + '45',
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.scoreBadge,
                { backgroundColor: gameType === 'ai' ? colors.xpOrange : '#7C5CBF' },
              ]}
            >
              <Text style={styles.scoreBadgeText}>{player2Score}</Text>
            </View>
            <Text style={[styles.scoreName, { color: colors.text }]} numberOfLines={1}>
              {player2Name}
            </Text>
            <Animated.View
              style={[
                styles.opponentAvatarBadge,
                {
                  backgroundColor: (gameType === 'ai' ? colors.xpOrange : '#7C5CBF') + '22',
                  transform:
                    isAITurn && !showResult
                      ? [{ translateY: botFloatAnim }, { rotate: botRotation }]
                      : [],
                },
              ]}
            >
              <AppIcon
                name={gameType === 'ai' ? 'bot' : 'users'}
                size={14}
                color={gameType === 'ai' ? colors.xpOrange : '#7C5CBF'}
              />
            </Animated.View>
          </View>
        </View>
      </ScreenHeader>

      {/* Turn Indicator / Animated Robot Thinking Stage */}
      <View style={styles.turnBanner}>
        {isAITurn && !showResult && !gameOver ? (
          <Animated.View
            style={[
              styles.robotThinkingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.xpOrange + '60',
                transform: [{ scale: turnBannerScale }],
              },
            ]}
          >
            <View style={styles.robotThinkingRow}>
              <View style={styles.robotAvatarStage}>
                <Animated.View
                  style={[
                    styles.robotHalo,
                    {
                      backgroundColor: colors.xpOrange,
                      opacity: botHaloOpacity,
                      transform: [{ scale: botHaloScale }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.robotAvatarCircle,
                    {
                      backgroundColor: colors.xpOrange + '20',
                      borderColor: colors.xpOrange,
                      transform: [{ translateY: botFloatAnim }, { rotate: botRotation }],
                    },
                  ]}
                >
                  <AppIcon name="bot" size={22} color={colors.xpOrange} />
                </Animated.View>
              </View>

              <View style={styles.robotThinkingContent}>
                <View style={styles.robotTitleRow}>
                  <Text style={[styles.robotThinkingTitle, { color: colors.xpOrange }]}>
                    {thinkingMessages[thinkingStage] || thinkingMessages[0]}
                  </Text>
                  <View style={styles.thinkingDotsRow}>
                    <Animated.View
                      style={[
                        styles.thinkingDot,
                        { backgroundColor: colors.xpOrange, transform: [{ translateY: dot1Anim }] },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.thinkingDot,
                        { backgroundColor: colors.xpOrange, transform: [{ translateY: dot2Anim }] },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.thinkingDot,
                        { backgroundColor: colors.xpOrange, transform: [{ translateY: dot3Anim }] },
                      ]}
                    />
                  </View>
                </View>

                <View style={[styles.thinkingBarTrack, { backgroundColor: colors.xpOrange + '20' }]}>
                  <Animated.View
                    style={[
                      styles.thinkingBarFill,
                      {
                        backgroundColor: colors.xpOrange,
                        width: thinkingWidth,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.turnPill,
              {
                transform: [{ scale: turnBannerScale }],
                backgroundColor:
                  currentTurn === 'player1'
                    ? colors.primary + '20'
                    : gameType === 'ai'
                      ? colors.xpOrange + '20'
                      : '#7C5CBF20',
              },
            ]}
          >
            <AppIcon
              name={currentTurn === 'player1' ? 'user' : gameType === 'ai' ? 'bot' : 'users'}
              size={14}
              color={
                currentTurn === 'player1'
                  ? colors.primary
                  : gameType === 'ai'
                    ? colors.xpOrange
                    : '#7C5CBF'
              }
            />
            <Text
              style={[
                styles.turnText,
                {
                  color:
                    currentTurn === 'player1'
                      ? colors.primary
                      : gameType === 'ai'
                        ? colors.xpOrange
                        : '#7C5CBF',
                },
              ]}
            >
              {currentTurn === 'player1'
                ? `${player1Name} — Igihe cyawe (Your turn)`
                : `${player2Name} — Igihe cye`}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Question */}
      <ScrollView style={styles.questionScroll} showsVerticalScrollIndicator={false}>
        {!gameOver && currentQuestion && (
          <>
            <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.questionHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>
                    {currentQuestion.category}
                  </Text>
                </View>
                <Text style={[styles.questionNumber, { color: colors.textMuted }]}>
                  Q{currentQuestionIdx + 1} of {TOTAL_QUESTIONS}
                </Text>
              </View>
              <Text style={[styles.questionText, { color: colors.text }]}>
                {currentQuestion.question}
              </Text>
              <View
                style={[
                  styles.riddleBox,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.questionKiny, { color: colors.text }]}>
                  {currentQuestion.questionKiny}
                </Text>
              </View>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.answer;
                const isRobotScanning = isAITurn && !showResult && scanningOptionIdx === idx;
                let bgColor = colors.card;
                let borderColor = colors.border;
                let textColor = colors.text;

                if (showResult && isCorrectOption) {
                  bgColor = colors.success + '20';
                  borderColor = colors.success;
                  textColor = colors.success;
                } else if (showResult && isSelected && !isCorrectOption) {
                  bgColor = colors.error + '20';
                  borderColor = colors.error;
                  textColor = colors.error;
                } else if (!showResult && isSelected) {
                  bgColor = colors.primary + '20';
                  borderColor = colors.primary;
                  textColor = colors.primary;
                } else if (isRobotScanning) {
                  bgColor = colors.xpOrange + '14';
                  borderColor = colors.xpOrange;
                  textColor = colors.xpOrange;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionBtn,
                      {
                        backgroundColor: bgColor,
                        borderColor,
                        opacity: isAITurn && !showResult && !isRobotScanning ? 0.68 : 1,
                      },
                    ]}
                    onPress={() => handleAnswer(option, false)}
                    disabled={showResult || isAITurn}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.optionLetter,
                        {
                          color: textColor,
                          backgroundColor:
                            textColor === colors.text
                              ? colors.background
                              : 'rgba(255,255,255,0.2)',
                        },
                      ]}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Text>
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    {isRobotScanning && (
                      <View
                        style={[
                          styles.robotScanBadge,
                          { backgroundColor: colors.xpOrange + '22' },
                        ]}
                      >
                        <AppIcon name="bot" size={14} color={colors.xpOrange} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Result Banner */}
        {showResult && !gameOver && (
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: isCorrect ? colors.success + '20' : colors.error + '20',
              },
            ]}
          >
            <Text style={[styles.resultText, { color: isCorrect ? colors.success : colors.error }]}>
              {isCorrect
                ? currentTurn === 'player1'
                  ? 'Nibyo! +1 Point'
                  : `${player2Name} yasubije neza! +1`
                : currentTurn === 'player1'
                  ? 'Sibyo!'
                  : `${player2Name} yahushije!`}
            </Text>
            {!isCorrect && (
              <Text style={[styles.correctAnswer, { color: colors.textSecondary }]}>
                Igisubizo: {currentQuestion?.answer}
              </Text>
            )}
          </View>
        )}

        {/* Game Over */}
        {gameOver && (
          <View style={[styles.gameOverCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppIcon name="trophy" size={76} color={colors.secondary} />
            <Text style={[styles.gameOverTitle, { color: colors.text }]}>Warangije!</Text>
            <Text style={[styles.gameOverSubtitle, { color: colors.textSecondary }]}>
              Ibisakuzo {TOTAL_QUESTIONS} Byarangiye!
            </Text>

            <View style={[styles.finalScores, { backgroundColor: colors.background }]}>
              <View style={styles.finalScoreItem}>
                <Text style={[styles.finalScoreName, { color: colors.primary }]}>
                  {player1Name}
                </Text>
                <Text style={[styles.finalScoreValue, { color: colors.primary }]}>
                  {player1Score}
                </Text>
                <Text style={[styles.finalScoreLabel, { color: colors.textMuted }]}>
                  ibisubizo
                </Text>
              </View>
              <View style={[styles.finalScoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.finalScoreItem}>
                <Text
                  style={[
                    styles.finalScoreName,
                    { color: gameType === 'ai' ? colors.xpOrange : '#7C5CBF' },
                  ]}
                >
                  {player2Name}
                </Text>
                <Text
                  style={[
                    styles.finalScoreValue,
                    { color: gameType === 'ai' ? colors.xpOrange : '#7C5CBF' },
                  ]}
                >
                  {player2Score}
                </Text>
                <Text style={[styles.finalScoreLabel, { color: colors.textMuted }]}>
                  ibisubizo
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor:
                    player1Score > player2Score
                      ? colors.success + '20'
                      : player2Score > player1Score
                        ? colors.error + '20'
                        : colors.warning + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.resultText,
                  {
                    color:
                      player1Score > player2Score
                        ? colors.success
                        : player2Score > player1Score
                          ? colors.error
                          : colors.warning,
                  },
                ]}
              >
                {player1Score > player2Score
                  ? 'Watsinze! You Won! +75 XP'
                  : player2Score > player1Score
                    ? gameType === 'ai'
                      ? 'Robot Yatsinze! +15 XP'
                      : `${player2Name} Yatsinze! +15 XP`
                    : ' kunganya! Tie Game! +50 XP'}
              </Text>
            </View>

            <View style={styles.gameOverButtons}>
              <GlowButton
                style={[styles.playAgainBtn, { backgroundColor: colors.primary }]}
                glowColor={colors.primary}
                onPress={gameType === 'ai' ? startAIGame : startPassAndPlay}
              >
                <AppIcon name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.playAgainText}>Ongera Ukine</Text>
              </GlowButton>
              <AnimatedButton
                style={[
                  styles.menuBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={resetGame}
              >
                <Text style={[styles.menuBtnText, { color: colors.text }]}>Ibikubiyemo</Text>
              </AnimatedButton>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpPillText: { fontSize: 12, fontWeight: '800' },
  scroll: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 12 },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  modeIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: '800' },
  modeDesc: { fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  modeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  modeRewardText: { fontSize: 12, fontWeight: '800' },
  // Lobby styles
  roomCodeCard: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  roomCodeBox: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  roomCode: { fontSize: 36, fontWeight: '900', letterSpacing: 8 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  copyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  waitingBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  waitingText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  waitingHint: { fontSize: 12 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: { fontSize: 14, fontWeight: '700', maxWidth: 92, flexShrink: 1 },
  vsLabel: { fontSize: 14, fontWeight: '800', color: '#999' },
  codeHint: { fontSize: 12, marginTop: -12, marginBottom: 12, textAlign: 'center' },
  startBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  joinRoomCard: { padding: 24, borderRadius: 20, borderWidth: 1 },
  joinLabel: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  codeInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  joinBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  // Game playing styles
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  scorePlayer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 9,
  },
  opponentAvatarBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreName: { fontSize: 12.5, fontWeight: '700', maxWidth: 86 },
  scoreBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scoreVs: { fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' },
  turnBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  turnText: { fontSize: 12.5, fontWeight: '700' },
  robotThinkingCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  robotThinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  robotAvatarStage: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotHalo: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  robotAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotThinkingContent: {
    flex: 1,
    gap: 7,
  },
  robotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  robotThinkingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    flex: 1,
  },
  thinkingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 2,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  thinkingBarTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  thinkingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  robotScanBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionScroll: { flex: 1, padding: 16 },
  questionCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  questionNumber: { fontSize: 12, fontWeight: '600' },
  questionText: { fontSize: 18, fontWeight: '800', lineHeight: 26 },
  riddleBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  questionKiny: { fontSize: 15, lineHeight: 23, fontStyle: 'italic', fontWeight: '600' },
  optionsContainer: { gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
  },
  optionText: { fontSize: 15, fontWeight: '600', flex: 1 },
  resultBanner: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  resultText: { fontSize: 16, fontWeight: '800' },
  correctAnswer: { fontSize: 14, marginTop: 4 },
  gameOverCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    alignItems: 'center',
  },
  gameOverTitle: { fontSize: 28, fontWeight: '900', marginTop: 16 },
  gameOverSubtitle: { fontSize: 14, marginTop: 4 },
  finalScores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    gap: 20,
    width: '100%',
  },
  finalScoreItem: { alignItems: 'center', flex: 1 },
  finalScoreName: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  finalScoreValue: { fontSize: 36, fontWeight: '900' },
  finalScoreLabel: { fontSize: 11, marginTop: 2 },
  finalScoreDivider: { width: 1, height: 60 },
  gameOverButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  playAgainText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  menuBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  menuBtnText: { fontSize: 15, fontWeight: '700' },
});
