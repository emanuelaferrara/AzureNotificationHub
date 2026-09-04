import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { AppText } from '../../../components/AppText';
import Divider from '../../../components/Divider';
import {
  getRepositoryPreferences,
  setRepositoryPreferences,
  type RepositoryPreference,
} from '../../../services/azure/AzureService';
import { useAppTheme } from '../../../theme/useAppTheme';

type Props = { onClose: () => void };

export const RepositorySettingsScreen: React.FC<Props> = ({ onClose }) => {
  const theme = useAppTheme();
  const [repositories, setRepositories] = useState<RepositoryPreference[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const preferences = await getRepositoryPreferences();
      setRepositories(preferences.repositories);
      setSelectedNames(preferences.selectedNames);
    } catch (loadError) {
      console.error(
        '[settings] could not load repository preferences:',
        loadError,
      );
      setError('Could not load repositories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => {
    const byProject = new Map<string, RepositoryPreference[]>();
    repositories.forEach(repository => {
      const projectRepositories = byProject.get(repository.project) ?? [];
      projectRepositories.push(repository);
      byProject.set(repository.project, projectRepositories);
    });
    return [...byProject.entries()].map(([title, data]) => ({ title, data }));
  }, [repositories]);

  const selectedCount =
    selectedNames === null
      ? repositories.length
      : repositories.filter(repository =>
          selectedNames.includes(repository.name),
        ).length;

  const save = async (next: string[] | null) => {
    const previous = selectedNames;
    setSelectedNames(next);
    setSaving(true);
    setError(undefined);
    try {
      await setRepositoryPreferences(next);
    } catch (saveError) {
      console.error(
        '[settings] could not update repository preferences:',
        saveError,
      );
      setSelectedNames(previous);
      setError('Could not update repository filters.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (repository: RepositoryPreference, enabled: boolean) => {
    const next = new Set(
      selectedNames ??
        repositories.map(currentRepository => currentRepository.name),
    );
    if (enabled) next.add(repository.name);
    else next.delete(repository.name);
    save([...next]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.separator }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to subscription settings"
          onPress={onClose}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <AppText variant="body" style={{ color: theme.accent }}>
            Back
          </AppText>
        </Pressable>
        <View style={styles.heading}>
          <AppText variant="headline" style={{ color: theme.textPrimary }}>
            Repository Settings
          </AppText>
          {!loading && (
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {selectedCount} of {repositories.length} selected
            </AppText>
          )}
        </View>
        {!loading && repositories.length > 0 && (
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => save(selectedNames === null ? [] : null)}
          >
            <AppText variant="body" style={{ color: theme.accent }}>
              {selectedNames === null ? 'Select none' : 'Select all'}
            </AppText>
          </Pressable>
        )}
      </View>

      {error && (
        <View style={[styles.error, { backgroundColor: theme.cardUnread }]}>
          <AppText variant="body" style={{ color: theme.textPrimary }}>
            {error}
          </AppText>
          {repositories.length === 0 && (
            <Pressable accessibilityRole="button" onPress={load}>
              <AppText variant="body" style={{ color: theme.accent }}>
                Retry
              </AppText>
            </Pressable>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
          <AppText
            variant="body"
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading repositories…
          </AppText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={
            repositories.length === 0 ? styles.centered : undefined
          }
          ListEmptyComponent={
            error ? null : (
              <AppText variant="body" style={{ color: theme.textSecondary }}>
                No repositories found.
              </AppText>
            )
          }
          renderSectionHeader={({ section }) => (
            <View
              style={[
                styles.sectionHeader,
                { backgroundColor: theme.background },
              ]}
            >
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                {section.title}
              </AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <View>
              <View style={[styles.row, { backgroundColor: theme.card }]}>
                <AppText
                  variant="headline"
                  style={[styles.repositoryName, { color: theme.textPrimary }]}
                >
                  {item.name}
                </AppText>
                <Switch
                  accessibilityLabel={`${item.name} repository`}
                  value={
                    selectedNames === null || selectedNames.includes(item.name)
                  }
                  disabled={saving}
                  onValueChange={enabled => toggle(item, enabled)}
                  trackColor={{ false: theme.border, true: theme.accent }}
                />
              </View>
              <Divider />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { paddingVertical: 6, paddingEnd: 16 },
  heading: { flex: 1 },
  error: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  centered: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  repositoryName: { flex: 1, paddingEnd: 16 },
});
