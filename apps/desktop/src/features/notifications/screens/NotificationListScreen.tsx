import React, { useEffect, useState } from 'react';
import { Notification } from '../types/Notification';
import { NotificationItemView } from '../components/NotificationItemView';
import { View, FlatList } from 'react-native';
import { useAppTheme } from '../../../theme/useAppTheme';

export const NotificationListScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>();
  const theme = useAppTheme();
  useEffect(() => {
    const _notifications = fetchNotifications();
    setNotifications(_notifications);
  }, [setNotifications]);

  return (
    <View style={{ backgroundColor: theme.background }}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationItemView notification={item} />}
      />
    </View>
  );
};

function fetchNotifications(): Notification[] {
  const notification: Notification[] = [
    {
      id: '1',
      title: 'Nuovo messaggio da Marco',
      body: 'Marco ti ha inviato una richiesta di revisione per il progetto “AppHub”. Controlla i dettagli e rispondi entro la giornata.',
      category: 'unknown',
      createdAt: '14 Maggio 2026',
      read: false,
      metadata: { action: 'unknown' },
    },
    {
      id: '2',
      title: 'Promemoria: riunione alle 16:00',
      body: 'Hai una riunione con il team marketing alle 16:00 in sala conferenze B. Allegati disponibili nel calendario.',
      category: 'unknown',
      createdAt: '13 Maggio 2026',
      read: true,
      metadata: { action: 'unknown' },
    },
    {
      id: '3',
      title: 'Pagamento ricevuto',
      body: 'Il bonifico di 1.250,00 € è stato accreditato sul tuo conto. Verifica la transazione e scarica la fattura.',
      category: 'unknown',
      createdAt: '11 Maggio 2026',
      read: true,
      metadata: { action: 'unknown' },
    },
    {
      id: '4',
      title: 'Aggiornamento app disponibile',
      body: 'È disponibile la versione 2.8.1 dell’app. Risolve problemi di stabilità e migliora le prestazioni.',
      category: 'unknown',
      createdAt: '9 Maggio 2026',
      read: false,
      metadata: { action: 'unknown' },
    },
    {
      id: '5',
      title: 'Richiesta approvazione ferie',
      body: 'Giulia ha inviato una richiesta di ferie per il periodo 24-28 maggio. Ricorda di approvare o rifiutare entro 2 giorni.',
      category: 'unknown',
      createdAt: '5 Maggio 2026',
      read: false,
      metadata: { action: 'unknown' },
    },
    {
      id: '6',
      title: 'Consegna pacco in arrivo',
      body: 'Il tuo pacco è in consegna oggi tra le 10:00 e le 12:00. Tieni il telefono a portata di mano per la notifica del corriere.',
      category: 'unknown',
      createdAt: '4 Maggio 2026',
      read: true,
      metadata: { action: 'unknown' },
    },
    {
      id: '7',
      title: 'Verifica di sicurezza richiesta',
      body: 'È stata rilevata un’attività di accesso dal dispositivo sconosciuto. Verifica subito che si tratti di te.',
      category: 'unknown',
      createdAt: '1 Maggio 2026',
      read: false,
      metadata: { action: 'unknown' },
    },
  ];
  return notification;
}
