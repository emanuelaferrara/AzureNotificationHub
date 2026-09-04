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
  getRelaySubscriptions,
  setRelaySubscriptionEnabled,
  type RelaySubscription,
} from '../../../services/azure/AzureService';
import { useAppTheme } from '../../../theme/useAppTheme';

type Props = {
  onClose: () => void;
};

const CATEGORY_ORDER = [
  'Boards',
  'Repos',
  'Pipelines',
  'Test Plans',
  'Wiki',
  'Mentions',
  'Other',
];

export const SubscriptionSettingsScreen: React.FC<Props> = ({ onClose }) => {
  const theme = useAppTheme();
  const [subscriptions, setSubscriptions] = useState<RelaySubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setSubscriptions(await getRelaySubscriptions());
    } catch (loadError) {
      console.error('[settings] could not load subscriptions:', loadError);
      setError('Could not load subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const activeCount = useMemo(
    () => subscriptions.filter(subscription => subscription.enabled).length,
    [subscriptions],
  );

  const sections = useMemo(() => {
    const byCategory = new Map<string, RelaySubscription[]>();
    subscriptions.forEach(subscription => {
      const subscriptionsInCategory =
        byCategory.get(subscription.category) ?? [];
      subscriptionsInCategory.push(subscription);
      byCategory.set(subscription.category, subscriptionsInCategory);
    });

    return [...byCategory.entries()]
      .sort(([categoryA], [categoryB]) => {
        const indexA = CATEGORY_ORDER.indexOf(categoryA);
        const indexB = CATEGORY_ORDER.indexOf(categoryB);
        return (
          (indexA === -1 ? CATEGORY_ORDER.length : indexA) -
            (indexB === -1 ? CATEGORY_ORDER.length : indexB) ||
          categoryA.localeCompare(categoryB)
        );
      })
      .map(([title, data]) => ({ title, data }));
  }, [subscriptions]);

  const toggleSubscription = async (
    subscription: RelaySubscription,
    enabled: boolean,
  ) => {
    setError(undefined);
    setSubscriptions(current =>
      current.map(item =>
        item.id === subscription.id ? { ...item, enabled } : item,
      ),
    );
    setUpdatingIds(current => new Set(current).add(subscription.id));

    try {
      await setRelaySubscriptionEnabled(subscription.id, enabled);
    } catch (updateError) {
      console.error('[settings] could not update subscription:', updateError);
      setSubscriptions(current =>
        current.map(item =>
          item.id === subscription.id
            ? { ...item, enabled: subscription.enabled }
            : item,
        ),
      );
      setError(
        `Could not ${enabled ? 'enable' : 'disable'} “${subscription.label}”.`,
      );
    } finally {
      setUpdatingIds(current => {
        const next = new Set(current);
        next.delete(subscription.id);
        return next;
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.separator }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to notifications"
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
            Subscription Settings
          </AppText>
          {!loading && (
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {activeCount} of {subscriptions.length} active
            </AppText>
          )}
        </View>
      </View>

      {error && (
        <View style={[styles.error, { backgroundColor: theme.cardUnread }]}>
          <AppText variant="body" style={{ color: theme.textPrimary }}>
            {error}
          </AppText>
          {subscriptions.length === 0 && (
            <Pressable accessibilityRole="button" onPress={loadSubscriptions}>
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
            Loading subscriptions…
          </AppText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={
            subscriptions.length === 0 ? styles.centered : undefined
          }
          ListEmptyComponent={
            <AppText variant="body" style={{ color: theme.textSecondary }}>
              No app-managed subscriptions found.
            </AppText>
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
                <View style={styles.rowText}>
                  <AppText
                    variant="headline"
                    style={{ color: theme.textPrimary }}
                  >
                    {item.label}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    {item.enabled ? 'Active' : item.statusMessage || 'Inactive'}
                  </AppText>
                </View>
                <Switch
                  accessibilityLabel={`${item.label} subscription`}
                  value={item.enabled}
                  disabled={updatingIds.has(item.id)}
                  onValueChange={enabled => toggleSubscription(item, enabled)}
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
  rowText: { flex: 1, paddingEnd: 16 },
});
