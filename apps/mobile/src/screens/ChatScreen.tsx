import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import db from '../database/sqlite.service';
import { Message } from '@meshnet/protocol';

// Helper to decode Uint8Array to string
const decodePayload = (payload: any): string => {
  if (typeof payload === 'string') return payload;
  if (payload instanceof Uint8Array || Array.isArray(payload)) {
    try {
      return new TextDecoder().decode(new Uint8Array(payload));
    } catch (e) {
      return '[Binary Data]';
    }
  }
  return String(payload);
};

const ChatScreen = ({ route }: any) => {
  const { channelId, name } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const fetchMessages = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM messages WHERE channel_id = ? ORDER BY timestamp DESC',
        [channelId],
        (_, { rows }) => {
          setMessages(rows._array as Message[]);
        }
      );
    });
  };

  useEffect(() => {
    fetchMessages();
  }, [channelId]);

  const sendMessage = () => {
    // Logic to insert message into DB and trigger gossip
    // For MVP, just insert into local DB
    console.log("Sending:", inputText);
    setInputText('');
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 12, color: 'gray' }}>{item.senderId}</Text>
            <Text>{decodePayload(item.payload)}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={inputText}
          onChangeText={setInputText}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;
