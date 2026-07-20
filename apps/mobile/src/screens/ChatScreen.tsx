import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useMessageStore } from '../store/useMessageStore';
import { useChannelStore } from '../store/useChannelStore';

const ChatScreen = ({ route }: any) => {
  const { channelId, name } = route.params;
  const { messages, fetchMessages, sendMessage, blockUser, reportUser } = useMessageStore();
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    fetchMessages(channelId);
  }, [channelId]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(channelId, inputText, 'Me'); // 'Me' is placeholder for actual NodeID
      setInputText('');
    }
  };

  const decodePayload = (payload: any): string => {
    if (payload instanceof Uint8Array) {
      return new TextDecoder().decode(payload);
    }
    return String(payload);
  };

  const handleLongPress = (userId: string) => {
    if (userId === 'Me') return;

    Alert.alert(
      "User Actions",
      `What would you like to do with ${userId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report User",
          onPress: () => {
            if (Platform.OS === 'ios') {
              Alert.prompt(
                "Report User",
                "Reason for reporting:",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Submit", onPress: (reason) => reportUser(userId, reason || "No reason provided") }
                ]
              );
            } else {
              Alert.alert("Report User", "Report this user for inappropriate behavior?", [
                { text: "Cancel", style: "cancel" },
                { text: "Report", onPress: () => reportUser(userId, "Unspecified reason (Android)") }
              ]);
            }
          }
        },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Block User",
              `Are you sure you want to block ${userId}? Their messages will be hidden.`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "Block", style: "destructive", onPress: () => blockUser(userId) }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={messages[channelId] || []}
        keyExtractor={(item) => item.id}
        inverted
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => handleLongPress(item.senderId)}
            style={[styles.bubble, item.senderId === 'Me' ? styles.myBubble : styles.peerBubble]}
          >
            <Text style={styles.sender}>{item.senderId}</Text>
            <Text style={styles.text}>{decodePayload(item.payload)}</Text>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Send an offline message..."
          placeholderTextColor="#666"
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  input: { flex: 1, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  bubble: { margin: 10, padding: 10, borderRadius: 15, maxWidth: '80%' },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  peerBubble: { alignSelf: 'flex-start', backgroundColor: '#E9E9EB' },
  sender: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  text: { color: '#fff', fontSize: 16 },
  time: { fontSize: 9, alignSelf: 'flex-end', marginTop: 4, color: 'rgba(255,255,255,0.5)' }
});

// Update peer text color for visibility
styles.peerBubble.text = { color: '#000' } as any;
styles.peerBubble.sender = { fontSize: 10, color: '#666', marginBottom: 2 } as any;
styles.peerBubble.time = { fontSize: 9, alignSelf: 'flex-end', marginTop: 4, color: '#999' } as any;

export default ChatScreen;
