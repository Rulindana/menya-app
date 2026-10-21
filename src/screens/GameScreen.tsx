import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { AppModal } from '../components/AppModal';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { AnimatedButton, GlowButton, RippleButton } from '../components/AnimatedButton';
import { getRandomQuestions, GameQuestion } from '../data/gameQuestions';
import { createGameRoom, joinGameRoom, subscribeToGameRoom, GameRoom } from '../firebase/syncService';

type GameMode = 'menu' | 'ai' | 'multiplayer' | 'lobby' | 'playing';
type PlayerTurn = 'player1' | 'player2';

const TOTAL_QUESTIONS = 10;

export const GameScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, addXP } = useAppStore();
  
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
  const [player1Name] = useState(user?.displayName || 'You');
  const [player2Name, setPlayer2Name] = useState('AI');
  
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

  const currentQuestion = questions[currentQuestionIdx];

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
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  const startAIGame = () => {
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
    setPlayer2Name('AI');
    setGameMode('playing');
  };

  const createRoom = async () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setRoomCreated(true);
    setOpponentJoined(false);
    setGameMode('lobby');
    // Try Firebase, ignore errors
    try {
      await createGameRoom(code, user?.uid || 'local', player1Name);
    } catch (e) {
      // Firebase unavailable, local mode still works
    }
  };

  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinErrorMsg('Nyamuneka shyiramo kode y\'iciro');
      setShowJoinErrorModal(true);
      return;
    }
    if (code.length !== 6) {
      setJoinErrorMsg('Kode igomba kuba ifite inyuguti 6');
      setShowJoinErrorModal(true);
      return;
    }
    // Try Firebase first, fallback to local
    let success = false;
    try {
      success = await joinGameRoom(code, user?.uid || 'local', player1Name);
    } catch (e) {
      // Firebase unavailable, use local mode
    }
    setRoomCode(code);
    setIsHost(false);
    setPlayer2Name(success ? 'Umukiriya' : 'Umukinzi');
    setRoomCreated(true);
    setOpponentJoined(true);
    setGameMode('lobby');
  };

  const startGameFromLobby = () => {
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

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    
    if (correct) {
      if (currentTurn === 'player1') {
        setPlayer1Score(s => s + 1);
      } else {
        setPlayer2Score(s => s + 1);
      }
    }
    
    setTimeout(() => {
      if (currentQuestionIdx + 1 >= TOTAL_QUESTIONS) {
        setGameOver(true);
        if (player1Score > player2Score) {
          addXP(75);
        } else if (player2Score > player1Score) {
          // Opponent won
        } else {
          addXP(50);
        }
      } else {
        setCurrentQuestionIdx(i => i + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setCurrentTurn(t => t === 'player1' ? 'player2' : 'player1');
      }
    }, 1500);
  };

  const resetGame = () => {
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
    setPlayer2Name('AI');
  };

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <Text style={styles.headerTitle}>🎮 Ibisakuzo</Text>
          <Text style={styles.headerSubtitle}>Ibisakuzo 10</Text>
        </LinearGradient>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hitamo Uburyo bwo Gukina</Text>
          
          {/* Play vs AI */}
          <AnimatedButton 
            style={[styles.modeCard, { backgroundColor: colors.card }]}
            onPress={startAIGame}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.primary + '20' }]}>
              <AppIcon name="bot" size={32} color={colors.primary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Fungura na Robot 🤖</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Shakisha na mudasobwa • ibisakuzo 10
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary }]}>
              <AppIcon name="star1" size={14} color={colors.text} />
              <Text style={[styles.modeRewardText, { color: colors.text }]}>75 XP</Text>
            </View>
          </AnimatedButton>

          {/* Create Room */}
          <AnimatedButton 
            style={[styles.modeCard, { backgroundColor: colors.card }]}
            onPress={createRoom}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.xpOrange + '20' }]}>
              <AppIcon name="users" size={32} color={colors.xpOrange} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Fungura Iciro 🏠</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Shakisha kode & ugabane n'abakendi
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary }]}>
              <AppIcon name="star1" size={14} color={colors.text} />
              <Text style={[styles.modeRewardText, { color: colors.text }]}>75 XP</Text>
            </View>
          </AnimatedButton>

          {/* Join Room */}
          <AnimatedButton 
            style={[styles.modeCard, { backgroundColor: colors.card }]}
            onPress={() => setGameMode('lobby')}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.success + '20' }]}>
              <AppIcon name="copy" size={32} color={colors.success} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Jya mu Iciro 🔗</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Shyiramo kode kugira ngo ujye ku mugenzi
              </Text>
            </View>
            <View style={[styles.modeReward, { backgroundColor: colors.secondary }]}>
              <AppIcon name="star1" size={14} color={colors.text} />
              <Text style={[styles.modeRewardText, { color: colors.text }]}>75 XP</Text>
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
        <LinearGradient colors={[colors.xpOrange, '#E55A2B']} style={styles.header}>
          <TouchableOpacity onPress={resetGame} style={styles.backBtnWhite}>
            <Text style={styles.backTextWhite}>← Subira</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isHost ? '🏠 Iciro cyawe' : roomCreated ? '🔗 Wabonetse Iciro' : '🔗 Jya mu Iciro'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isHost ? 'Gabana kode n\'umugenzi' : roomCreated ? 'Ugomba gukina na ' + player2Name : 'Shyiramo kode y\'iciro'}
          </Text>
        </LinearGradient>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {isHost ? (
            // Host view - waiting for opponent
            <View style={[styles.roomCodeCard, { backgroundColor: colors.card }]}>
              {/* Player names */}
              <View style={styles.playerRow}>
                <View style={[styles.playerAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.playerEmoji}>👤</Text>
                </View>
                <Text style={[styles.playerName, { color: colors.text }]}>{player1Name}</Text>
                <Text style={[styles.vsLabel, { color: colors.textMuted }]}>vs</Text>
                <View style={[styles.playerAvatar, { backgroundColor: opponentJoined ? colors.xpOrange : colors.border }]}>
                  <Text style={styles.playerEmoji}>{opponentJoined ? '👤' : '?'}</Text>
                </View>
                <Text style={[styles.playerName, { color: opponentJoined ? colors.text : colors.textMuted }]}>                    {opponentJoined ? player2Name : 'Gutegereza...'}</Text>
              </View>

              <View style={[styles.roomCodeBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.roomCode, { color: colors.primary }]}>{roomCode}</Text>
              </View>
              <AnimatedButton 
                style={[styles.copyBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setCopiedCode(roomCode);
                  setShowCodeCopiedModal(true);
                }}
              >
                <AppIcon name="copy" size={18} color="#FFFFFF" />
                <Text style={styles.copyBtnText}>Koporoze Kode</Text>
              </AnimatedButton>

              {opponentJoined ? (
                <AnimatedButton 
                  style={[styles.startBtn, { backgroundColor: colors.primary }]}
                  onPress={startGameFromLobby}
                >
                  <Text style={styles.startBtnText}>Tangira Ukina! 🎮</Text>
                </AnimatedButton>
              ) : (
                <View style={[styles.waitingBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.waitingText, { color: colors.textSecondary }]}>
                    ⏳ Gutegereza umukiriya...
                  </Text>
                  <Text style={[styles.waitingHint, { color: colors.textMuted }]}>
                    Gabana iyi kode: {roomCode}
                  </Text>
                  <Text style={[styles.waitingHint, { color: colors.textMuted, marginTop: 8 }]}>
                    Umukiriya azaba yereka hasi igiyo yinjiye
                  </Text>
                </View>
              )}
            </View>
          ) : roomCreated ? (
            // Joiner view - opponent found, ready to play
            <View style={[styles.roomCodeCard, { backgroundColor: colors.card }]}>
              {/* Player names */}
              <View style={styles.playerRow}>
                <View style={[styles.playerAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.playerEmoji}>👤</Text>
                </View>
                <Text style={[styles.playerName, { color: colors.text }]}>{player1Name}</Text>
                <Text style={[styles.vsLabel, { color: colors.textMuted }]}>vs</Text>
                <View style={[styles.playerAvatar, { backgroundColor: colors.xpOrange }]}>
                  <Text style={styles.playerEmoji}>👤</Text>
                </View>
                <Text style={[styles.playerName, { color: colors.text }]}>{player2Name}</Text>
              </View>

              <AnimatedButton 
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={startGameFromLobby}
              >
                <Text style={styles.startBtnText}>Tangira Ukina! 🎮</Text>
              </AnimatedButton>
            </View>
          ) : (
            // Join Room - Enter code
            <View style={[styles.joinRoomCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.joinLabel, { color: colors.text }]}>
                Shyiramo Kode y\'Iciro
              </Text>
              <TextInput
                style={[styles.codeInput, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: joinCode.length === 6 ? colors.primary : colors.border 
                }]}
                placeholder="Shyiramo kode y'inyuguti 6"
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
                style={[styles.joinBtn, { 
                  backgroundColor: joinCode.length >= 6 ? colors.primary : colors.border 
                }]}
                onPress={joinRoom}
                disabled={joinCode.length < 6}
              >
                <Text style={styles.joinBtnText}>Jya mu Iciro</Text>
              </AnimatedButton>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // Playing Screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Game Header */}
      <View style={[styles.gameHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={resetGame} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Subira</Text>
        </TouchableOpacity>
        
        <View style={[styles.gameTypeBadge, { 
          backgroundColor: gameType === 'ai' ? colors.primary + '20' : colors.xpOrange + '20' 
        }]}>
          {gameType === 'ai' ? (
            <AppIcon name="bot" size={14} color={colors.primary} />
          ) : (
            <AppIcon name="users" size={14} color={colors.xpOrange} />
          )}
          <Text style={[styles.gameTypeText, { 
            color: gameType === 'ai' ? colors.primary : colors.xpOrange 
          }]}>
            {gameType === 'ai' ? 'na Robot' : 'na Umukinzi'}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.questionCounter, { color: colors.text }]}>
            {currentQuestionIdx + 1}/{TOTAL_QUESTIONS}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { 
              width: `${((currentQuestionIdx + 1) / TOTAL_QUESTIONS) * 100}%`,
              backgroundColor: gameType === 'ai' ? colors.primary : colors.xpOrange 
            }]} />
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreName, { color: colors.primary }]}>{player1Name}</Text>
            <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.scoreText}>{player1Score}</Text>
            </View>
          </View>
          <Text style={[styles.vsText, { color: colors.textMuted }]}>na</Text>
          <View style={styles.scoreItem}>
            <View style={[styles.scoreBadge, { backgroundColor: gameType === 'ai' ? colors.xpOrange : '#9C27B0' }]}>
              <Text style={styles.scoreText}>{player2Score}</Text>
            </View>
            <Text style={[styles.scoreName, { color: gameType === 'ai' ? colors.xpOrange : '#9C27B0' }]}>
              {player2Name}
            </Text>
          </View>
        </View>
      </View>

      {/* Turn Indicator */}
      <View style={[styles.turnBanner, { 
        backgroundColor: currentTurn === 'player1' ? colors.primary + '20' : 
                        gameType === 'ai' ? colors.xpOrange + '20' : '#9C27B020'
      }]}>
        <Text style={[styles.turnText, { 
          color: currentTurn === 'player1' ? colors.primary : 
                gameType === 'ai' ? colors.xpOrange : '#9C27B0'
        }]}>
          {currentTurn === 'player1' ? `👤 ${player1Name} igihe cye` : 
           gameType === 'ai' ? `🤖 ${player2Name} igihe cye` : `👤 ${player2Name} igihe cye`}
        </Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.questionScroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.questionCard, { backgroundColor: colors.card }]}>
          <View style={styles.questionHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>{currentQuestion?.category}</Text>
            </View>
            <Text style={[styles.questionNumber, { color: colors.textMuted }]}>
              Q{currentQuestionIdx + 1}
            </Text>
          </View>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion?.question}
          </Text>
          <Text style={[styles.questionKiny, { color: colors.textSecondary }]}>
            {currentQuestion?.questionKiny}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.answer;
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
            }

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
                onPress={() => handleAnswer(option)}
                disabled={showResult}
              >
                <Text style={[styles.optionLetter, { 
                  color: textColor,
                  backgroundColor: textColor === colors.text ? colors.background : 'rgba(255,255,255,0.2)'
                }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result Banner */}
        {showResult && (
          <View style={[styles.resultBanner, { 
            backgroundColor: isCorrect ? colors.success + '20' : colors.error + '20' 
          }]}>
            <Text style={[styles.resultText, { color: isCorrect ? colors.success : colors.error }]}>
              {isCorrect ? '✅ Nibyo!' : '❌ Sibyo!'}
            </Text>
            {!isCorrect && (
              <Text style={[styles.correctAnswer, { color: colors.textSecondary }]}>
                ✓ Igisubizo: {currentQuestion.answer}
              </Text>
            )}
          </View>
        )}

        {/* Game Over */}
        {gameOver && (
          <View style={[styles.gameOverCard, { backgroundColor: colors.card }]}>
            <AppIcon name="trophy" size={80} color={colors.secondary} />
            <Text style={[styles.gameOverTitle, { color: colors.text }]}>Warangije! 🎉</Text>
            <Text style={[styles.gameOverSubtitle, { color: colors.textSecondary }]}>
              Ibisakuzo 10 Byarangiye!
            </Text>
            
            <View style={[styles.finalScores, { backgroundColor: colors.background }]}>
              <View style={styles.finalScoreItem}>
                <Text style={[styles.finalScoreName, { color: colors.primary }]}>{player1Name}</Text>
                <Text style={[styles.finalScoreValue, { color: colors.primary }]}>{player1Score}</Text>
                <Text style={[styles.finalScoreLabel, { color: colors.textMuted }]}>ibisubizo</Text>
              </View>
              <View style={[styles.finalScoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.finalScoreItem}>
                <Text style={[styles.finalScoreName, { color: gameType === 'ai' ? colors.xpOrange : '#9C27B0' }]}>
                  {player2Name}
                </Text>
                <Text style={[styles.finalScoreValue, { color: gameType === 'ai' ? colors.xpOrange : '#9C27B0' }]}>
                  {player2Score}
                </Text>
                <Text style={[styles.finalScoreLabel, { color: colors.textMuted }]}>ibisubizo</Text>
              </View>
            </View>

            <View style={[styles.resultBanner, { 
              backgroundColor: player1Score > player2Score ? colors.success + '20' : 
                              player2Score > player1Score ? colors.error + '20' : colors.warning + '20'
            }]}>
              <Text style={[styles.resultText, { 
                color: player1Score > player2Score ? colors.success : 
                       player2Score > player1Score ? colors.error : colors.warning
              }]}>
                {player1Score > player2Score ? '🏆 Urabasha! +75 XP' : 
                 player2Score > player1Score ? 
                   (gameType === 'ai' ? '😔 Robot Arabasha!' : '😔 Urapfa!') : 
                   '🤝 Igice! +50 XP'}
              </Text>
            </View>

            <View style={styles.gameOverButtons}>
              <GlowButton 
                style={[styles.playAgainBtn, { backgroundColor: colors.primary }]}
                glowColor={colors.primary}
                onPress={gameType === 'ai' ? startAIGame : resetGame}
              >
                <AppIcon name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.playAgainText}>Fungura Ukina</Text>
              </GlowButton>
              <AnimatedButton 
                style={[styles.menuBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={resetGame}
              >
                <Text style={[styles.menuBtnText, { color: colors.text }]}>Ibikubiyemo</Text>
              </AnimatedButton>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <AppModal
        visible={showJoinErrorModal}
        title="Ikosa"
        message={joinErrorMsg}
        type="error"
        icon="🔗"
        showCancel={false}
        confirmText="Sawe"
        onConfirm={() => setShowJoinErrorModal(false)}
      />

      <AppModal
        visible={showCodeCopiedModal}
        title="Kode Yacobose!"
        message={`Kode y'iciro: ${copiedCode}`}
        type="success"
        icon="📋"
        showCancel={false}
        confirmText="Sawe"
        onConfirm={() => setShowCodeCopiedModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  backBtnWhite: { marginBottom: 12 },
  backTextWhite: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  scroll: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 12 },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  modeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: '700' },
  modeDesc: { fontSize: 12, marginTop: 2 },
  modeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  modeRewardText: { fontSize: 12, fontWeight: '700' },
  // Lobby styles
  roomCodeCard: { padding: 24, borderRadius: 20, alignItems: 'center' },
  roomCodeLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
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
    marginBottom: 20,
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
  playerEmoji: { fontSize: 18 },
  playerName: { fontSize: 14, fontWeight: '700', maxWidth: 80 },
  vsLabel: { fontSize: 14, fontWeight: '800', color: '#999' },
  codeHint: { fontSize: 12, marginTop: -12, marginBottom: 12, textAlign: 'center' },
  startBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  joinRoomCard: { padding: 24, borderRadius: 20 },
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
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 14, fontWeight: '600' },
  gameTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  gameTypeText: { fontSize: 10, fontWeight: '700' },
  progressContainer: { alignItems: 'center' },
  questionCounter: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  progressBar: { width: 60, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreItem: { alignItems: 'center' },
  scoreName: { fontSize: 9, fontWeight: '600', marginBottom: 2 },
  scoreBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  vsText: { fontSize: 10, fontWeight: '600' },
  turnBanner: { padding: 8, alignItems: 'center' },
  turnText: { fontSize: 13, fontWeight: '700' },
  questionScroll: { flex: 1, padding: 16 },
  questionCard: { padding: 20, borderRadius: 16, marginBottom: 16 },
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
  questionKiny: { fontSize: 14, marginTop: 8, fontStyle: 'italic' },
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
  },
  resultText: { fontSize: 16, fontWeight: '800' },
  correctAnswer: { fontSize: 14, marginTop: 4 },
  gameOverCard: { padding: 24, borderRadius: 20, marginTop: 20, alignItems: 'center' },
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
  },
  finalScoreItem: { alignItems: 'center' },
  finalScoreName: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  finalScoreValue: { fontSize: 36, fontWeight: '900' },
  finalScoreLabel: { fontSize: 11, marginTop: 2 },
  finalScoreDivider: { width: 1, height: 60 },
  gameOverButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  playAgainText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  menuBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  menuBtnText: { fontSize: 16, fontWeight: '700' },
});
