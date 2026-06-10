// ─────────────────────────────────────────────
// Экран Профиля — пятый таб.
// Содержит: hero-карта, статистика, BUDGET-карточки,
// preferences (темa, тогглы), управление данными.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBG } from '../components/ScreenBG';
import { Glass } from '../components/Glass';
import { Switch, Segmented } from '../components/Switch';
import { Sheet } from '../components/Sheet';
import { InlineSheet } from '../components/InlineSheet';
import { EditProfileSheet } from '../components/EditProfileSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  PencilIcon,
  ChevronRightThin,
  MoonIcon,
  SunIcon,
  DownloadIcon,
  UploadIcon,
  BellIcon,
  RefreshIcon,
  InfoIcon,
} from '../components/Icons';
import { useThemeColors } from '../store/ThemeContext';
import { useProfile } from '../store/ProfileContext';
import { useBudget } from '../store/BudgetContext';
import { useToast } from '../store/ToastContext';
import { tg } from '../theme';
import type { ThemeColors } from '../theme';
import { deriveProfileStats } from '../store/profile/stats';

export function ProfileScreen() {
  const colors = useThemeColors();
  const { profile, preferences, setPreferences, setThemeMode, resetProfileFully, buildSnapshot, parseSnapshot, applyImported } =
    useProfile();
  const budget = useBudget();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [stubOpen, setStubOpen] = useState<{ title: string; message: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Двухкнопочные подтверждения через кастомный <ConfirmDialog>
  // (не Alert.alert) — это исправляет баг «Сбросить» на web,
  // где window.confirm перехватывался браузером.
  const [confirmReplace, setConfirmReplace] = useState<null | (() => void)>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const fullSnapshot = budget.exportData();
  const realStats = deriveProfileStats(fullSnapshot);

  const monthlyBudget = budget.budget?.income ?? 0;
  const envelopesCount = realStats.envelopesCount;

  const onExport = async () => {
    try {
      const json = buildSnapshot(fullSnapshot);
      await Share.share({
        message: json,
        title: 'Бэкап Vault Finance',
      });
      showToast('Экспорт данных прошел успешно', 'success');
    } catch {
      showToast('Не удалось поделиться. Попробуйте ещё раз.', 'error');
    }
  };

  const onImport = () => {
    setImportText('');
    setImportOpen(true);
  };

  const submitImport = () => {
    const result = parseSnapshot(importText);
    if (!result.ok) {
      showToast(result.reason || 'Не удалось импортировать', 'error');
      return;
    }
    // Открываем подтверждение замены — реальный апплай произойдёт в onConfirm.
    setConfirmReplace(() => () => {
      applyImported(result.snapshot, (b) => budget.importData(b));
      setImportOpen(false);
      setConfirmReplace(null);
      showToast('Импорт данных прошел успешно!', 'success');
    });
  };

  const onReset = () => setConfirmReset(true);

  const performReset = () => {
    resetProfileFully();
    setConfirmReset(false);
    showToast('Профиль сброшен', 'success');
  };

  const onResetAll = () => setConfirmResetAll(true);

  const performResetAll = () => {
    // Полный сброс: и профиль, и финансы.
    resetProfileFully();
    budget.resetAll();
    setConfirmResetAll(false);
    showToast('Все данные удалены', 'success');
  };

  const showStub = (title: string, message: string) => setStubOpen({ title, message });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBottom }}>
      <ScreenBG variant="home" />
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Профиль</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.6, marginTop: 2 }}>
            Аккаунт
          </Text>
        </View>

        {/* Hero card — tappable */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Pressable
            onPress={() => setEditOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Редактировать профиль"
          >
            <Glass padding={20} radius={28}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: profile.avatarColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: profile.avatarColor,
                    shadowOpacity: 0.35,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 6,
                  }}
                >
                  <Ionicons
                    name={profile.avatarIcon as React.ComponentProps<typeof Ionicons>['name']}
                    size={28}
                    color="#fff"
                  />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>
                    {profile.name || 'Без имени'}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 2 }}>
                    {profile.email || 'Добавьте email'}
                  </Text>
                  <View
                    style={{
                      marginTop: 8,
                      alignSelf: 'flex-start',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: profile.tier === 'pro' ? colors.amber + '33' : colors.surfaceStrong,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: profile.tier === 'pro' ? colors.amber : colors.textDim,
                        letterSpacing: 0.5,
                      }}
                    >
                      {profile.tier === 'pro' ? 'PRO' : 'FREE'}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.surfaceStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PencilIcon color={colors.textDim} size={14} />
                </View>
              </View>

              {/* Stats row */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 18,
                  paddingTop: 16,
                  borderTopWidth: 0.5,
                  borderTopColor: colors.divider,
                }}
              >
                <StatCell label="Месяцев активно" value={String(realStats.monthsActive)} colors={colors} />
                <StatCell
                  label="Накоплено"
                  value={tg(realStats.totalSavedTg)}
                  colors={colors}
                />
                <StatCell label="Транзакций" value={String(realStats.totalTxCount)} colors={colors} />
              </View>
            </Glass>
          </Pressable>
        </View>

        {/* BUDGET section */}
        <SectionLabel colors={colors}>BUDGET</SectionLabel>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <RowCard
            colors={colors}
            icon={<Ionicons name="cash" size={18} color={colors.green} />}
            title="Бюджет на месяц"
            value={monthlyBudget > 0 ? tg(monthlyBudget) : 'Не задан'}
            onPress={() =>
              showStub(
                'Бюджет на месяц',
                'Управляйте бюджетом на вкладке «Бюджет» — там можно задать доход и распределить его по конвертам.'
              )
            }
          />
          <RowCard
            colors={colors}
            icon={<Ionicons name="albums" size={18} color={colors.blue} />}
            title="Категории"
            value={`${envelopesCount} конвертов`}
            onPress={() =>
              showStub(
                'Категории',
                'Создавайте и редактируйте конверты в окне «Изменить» на вкладке «Бюджет».'
              )
            }
          />
          <RowCard
            colors={colors}
            icon={<Ionicons name="repeat" size={18} color={colors.purple} />}
            title="Регулярные платежи"
            badge="Скоро"
            onPress={() =>
              showStub(
                'Регулярные платежи',
                'Скоро вы сможете задавать платежи, которые повторяются каждый месяц или неделю.'
              )
            }
          />
          <RowCard
            colors={colors}
            icon={<Ionicons name="sparkles" size={18} color={colors.amber} />}
            title="Авто-категоризация"
            badge="Скоро"
            onPress={() =>
              showStub(
                'Авто-категоризация',
                'Готовим правила, по которым приложение само будет распределять расходы по конвертам.'
              )
            }
          />
        </View>

        {/* PREFERENCES section */}
        <SectionLabel colors={colors}>ПРЕДПОЧТЕНИЯ</SectionLabel>
        <View style={{ paddingHorizontal: 20 }}>
          <Glass padding={16} radius={22}>
            <ToggleRow
              colors={colors}
              icon={<Ionicons name="cash" size={16} color={colors.blue} />}
              title="Авто-распределение дохода"
              subtitle="Доход автоматически делится по конвертам по плану предыдущего месяца"
              value={preferences.autoDistributeIncome}
              onChange={(v) => setPreferences({ autoDistributeIncome: v })}
            />
            <Divider colors={colors} />
            <ToggleRow
              colors={colors}
              icon={<BellIcon color={colors.amber} size={16} />}
              title="Алерты при перерасходе"
              subtitle={`Предупреждать, если расход по конверту > ${preferences.overspendThresholdPct}%`}
              value={preferences.overspendAlerts}
              onChange={(v) => setPreferences({ overspendAlerts: v })}
            />
            <Divider colors={colors} />
            <View style={{ paddingVertical: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.surfaceStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <MoonIcon color={colors.textDim} size={14} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Тема</Text>
              </View>
              <Segmented
                value={preferences.themeMode}
                onChange={setThemeMode}
                options={[
                  { id: 'system', label: 'Авто' },
                  { id: 'light', label: 'Светлая', icon: <SunIcon color={colors.amber} size={14} /> },
                  { id: 'dark', label: 'Тёмная', icon: <MoonIcon color={colors.textDim} size={14} /> },
                ]}
              />
            </View>
          </Glass>
        </View>

        {/* DATA section */}
        <SectionLabel colors={colors}>ДАННЫЕ</SectionLabel>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <RowCard
            colors={colors}
            icon={<DownloadIcon color={colors.blueLight} size={18} />}
            title="Экспорт данных"
            subtitle="Поделиться JSON-бэкапом всех данных"
            onPress={onExport}
          />
          <RowCard
            colors={colors}
            icon={<UploadIcon color={colors.green} size={18} />}
            title="Импорт данных"
            subtitle="Восстановить данные из бэкапа"
            onPress={onImport}
          />
          <RowCard
            colors={colors}
            icon={<RefreshIcon color={colors.pink} size={18} />}
            title="Сбросить профиль"
            subtitle="Имя, аватар и preferences по умолчанию"
            onPress={onReset}
          />
          <RowCard
            colors={colors}
            icon={<Ionicons name="trash" size={18} color={colors.pink} />}
            title="Сбросить все данные"
            subtitle="Профиль + бюджет, конверты и расходы"
            onPress={onResetAll}
          />
        </View>

        {/* ABOUT */}
        <SectionLabel colors={colors}>О ПРИЛОЖЕНИИ</SectionLabel>
        <View style={{ paddingHorizontal: 20 }}>
          <Glass padding={16} radius={22}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.surfaceStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <InfoIcon color={colors.textDim} size={14} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Vault Finance</Text>
              <Text style={{ marginLeft: 'auto' as unknown as number, fontSize: 13, color: colors.textDim }}>v1.0.0</Text>
            </View>
          </Glass>
        </View>
      </ScrollView>

      <EditProfileSheet visible={editOpen} onClose={() => setEditOpen(false)} />

      {/* Импорт-окно */}
      <InlineSheet visible={importOpen} onClose={() => setImportOpen(false)} height="80%">
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
            Импорт данных
          </Text>
          <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 4 }}>
            Вставьте JSON, полученный через «Экспорт данных»
          </Text>

          <View
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 16,
              backgroundColor: colors.surfaceLite,
              borderWidth: 0.5,
              borderColor: colors.glassBorder,
              minHeight: 200,
            }}
          >
            <TextInput
              value={importText}
              onChangeText={setImportText}
              placeholder='{"version":1,"createdAt":"…","profile":{…}}'
              placeholderTextColor={colors.textGhost}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                color: colors.text,
                fontSize: 13,
                fontFamily: undefined,
                minHeight: 180,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <Pressable
            onPress={submitImport}
            disabled={importText.trim().length === 0}
            style={{ marginTop: 16, opacity: importText.trim().length === 0 ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={['#4D8BFF', '#2E5FE0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                height: 50,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 }}>
                Восстановить
              </Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => setImportOpen(false)}
            style={{ marginTop: 8, alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ color: colors.textDim, fontSize: 14, fontWeight: '500' }}>Отмена</Text>
          </Pressable>
        </View>
      </InlineSheet>

      {/* Стаб-окно для будущих фич */}
      <Sheet visible={!!stubOpen} onClose={() => setStubOpen(null)} height="40%">
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              alignSelf: 'center',
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.surfaceStrong,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4,
              marginBottom: 12,
            }}
          >
            <Ionicons name="time-outline" size={28} color={colors.amber} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', letterSpacing: -0.3 }}>
            {stubOpen?.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textDim,
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {stubOpen?.message}
          </Text>
          <Pressable
            onPress={() => setStubOpen(null)}
            style={{ marginTop: 22, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: colors.surfaceStrong }}
          >
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>Понятно</Text>
          </Pressable>
        </View>
      </Sheet>

      {/* Подтверждение замены данных при импорте */}
      <ConfirmDialog
        visible={!!confirmReplace}
        title="Заменить все данные?"
        message="Текущие конверты, бюджеты и расходы будут заменены данными из бэкапа."
        confirmLabel="Заменить"
        destructive
        onConfirm={() => confirmReplace?.()}
        onCancel={() => setConfirmReplace(null)}
      />

      {/* Подтверждение сброса профиля */}
      <ConfirmDialog
        visible={confirmReset}
        title="Сбросить настройки профиля?"
        message="Имя, аватар и тогглы вернутся к значениям по умолчанию. Финансовые данные останутся."
        confirmLabel="Сбросить"
        destructive
        onConfirm={performReset}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Подтверждение полного сброса (профиль + бюджет) */}
      <ConfirmDialog
        visible={confirmResetAll}
        title="Сбросить все данные?"
        message="Будут удалены конверты, расходы, бюджеты, цели и ипотека. Это действие необратимо."
        confirmLabel="Удалить всё"
        destructive
        onConfirm={performResetAll}
        onCancel={() => setConfirmResetAll(false)}
      />
    </View>
  );
}

function StatCell({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.2,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textDim,
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionLabel({
  colors,
  children,
}: {
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        paddingHorizontal: 20,
        marginTop: 26,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function RowCard({
  colors,
  icon,
  title,
  subtitle,
  value,
  badge,
  onPress,
}: {
  colors: ThemeColors;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <Glass padding={14} radius={18}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.surfaceStrong,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            {icon}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{title}</Text>
            {!!subtitle && (
              <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>{subtitle}</Text>
            )}
          </View>
          {!!value && (
            <Text style={{ fontSize: 14, color: colors.textDim, marginRight: 8, fontWeight: '600' }}>
              {value}
            </Text>
          )}
          {!!badge && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: colors.amberSoft,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 10, color: colors.amberStrong, fontWeight: '700', letterSpacing: 0.4 }}>
                {badge}
              </Text>
            </View>
          )}
          <ChevronRightThin color={colors.textFaint} size={16} />
        </View>
      </Glass>
    </Pressable>
  );
}

function ToggleRow({
  colors,
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  colors: ThemeColors;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.surfaceStrong,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{title}</Text>
        {!!subtitle && (
          <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      <Switch value={value} onChange={onChange} />
    </View>
  );
}

function Divider({ colors }: { colors: ThemeColors }) {
  return <View style={{ height: 0.5, backgroundColor: colors.divider, marginLeft: 38 }} />;
}
